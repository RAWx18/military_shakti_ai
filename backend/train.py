import torch
from transformers import AutoTokenizer
import sys
import logging
import importlib
sys.path.append('/home/raw/Desktop/Coding/military_int_icc/airavata-framework/training-pipeline')

from trainer import ModularShaktiTrainer
from dataset import TrainingLogger, create_dataloaders

sys.path.append('/home/raw/Desktop/Coding/military_int_icc/shakti-2B-041224')

# Dynamically import the configuration and model
config_module_path = "/home/raw/Desktop/Coding/military_int_icc/shakti-2B-041224/configuration_shakti.py"
model_module_path = "/home/raw/Desktop/Coding/military_int_icc/shakti-2B-041224/modeling_shakti.py"

# Load the configuration module dynamically
spec_config = importlib.util.spec_from_file_location("shaktiConfig", config_module_path)
config_module = importlib.util.module_from_spec(spec_config)
sys.modules["shaktiConfig"] = config_module
spec_config.loader.exec_module(config_module)

# Load the model module dynamically
spec_model = importlib.util.spec_from_file_location("shaktiModel", model_module_path)
model_module = importlib.util.module_from_spec(spec_model)
sys.modules["shaktiModel"] = model_module
spec_model.loader.exec_module(model_module)

from shaktiConfig import shaktiConfig
from shaktiModel import shaktiModel

def train(
    model_dir: str,
    data_path: str,
    output_dir: str,
    log_dir: str = './logs',
    mode: str = 'full',
    batch_size: int = 4,
    num_epochs: int = 5,
    learning_rate: float = 1e-4
):
    # Initialize logging
    logger = TrainingLogger(log_dir, mode)
    
    # Load model and tokenizer
    config = shaktiConfig.from_pretrained(model_dir)
    model = shaktiModel.from_pretrained(
        model_dir,
        config=config,
        attn_implementation='sdpa',
        torch_dtype=torch.float16
    )
    tokenizer = AutoTokenizer.from_pretrained(model_dir)

    # Initialize trainer
    trainer = ModularShaktiTrainer(
        model=model,
        tokenizer=tokenizer,
        train_mode=mode,
        lora_rank=16,
        temperature=2.0,
        kd_alpha=0.3,
        learning_rate=learning_rate
    )
    
    # Create dataloaders
    dataloaders = create_dataloaders(data_path, trainer.processor, mode, batch_size)
    
    # Check if datasets are empty
    if len(dataloaders['train'].dataset) == 0:
        raise ValueError(f"No training data found for mode: {mode}")
    
    logging.info(f"Dataset sizes - Train: {len(dataloaders['train'].dataset)}, "
                f"Val: {len(dataloaders['val'].dataset)}, "
                f"Test: {len(dataloaders['test'].dataset)}")

    # Training loop
    best_val_loss = float('inf')
    for epoch in range(num_epochs):
        # Training phase
        trainer.model.train()
        train_metrics = {'loss': 0, 'accuracy': 0}
        total_batches = 0
        
        for batch in dataloaders['train']:
            batch = {k: v.cuda() if isinstance(v, torch.Tensor) else v 
                    for k, v in batch.items()}
            
            losses = trainer.train_step(batch)
            train_metrics['loss'] += losses['total_loss']
            total_batches += 1
        
        # Avoid division by zero
        if total_batches > 0:
            train_metrics['loss'] /= total_batches
        else:
            logging.warning("No batches processed in training phase")
            continue
        
        # Validation phase
        trainer.model.eval()
        val_metrics = {'loss': 0, 'accuracy': 0}
        val_batches = 0
        
        with torch.no_grad():
            for batch in dataloaders['val']:
                batch = {k: v.cuda() if isinstance(v, torch.Tensor) else v 
                        for k, v in batch.items()}
                
                student_outputs = trainer.model(**batch)
                val_metrics['loss'] += student_outputs.loss.item()
                val_batches += 1
        
        # Avoid division by zero
        if val_batches > 0:
            val_metrics['loss'] /= val_batches
        else:
            val_metrics['loss'] = train_metrics['loss']  # Fallback to train loss
            logging.warning("No batches processed in validation phase")
        
        # Log metrics
        logger.log_epoch(epoch, train_metrics, val_metrics)
        
        # Save best model
        if val_metrics['loss'] < best_val_loss:
            best_val_loss = val_metrics['loss']
            trainer.save_lora_weights(f"{output_dir}/best_model")
        
        # Save checkpoint
        trainer.save_lora_weights(f"{output_dir}/epoch_{epoch+1}")
        
        logging.info(f"Epoch {epoch+1}/{num_epochs} - "
                    f"Train Loss: {train_metrics['loss']:.4f}, "
                    f"Val Loss: {val_metrics['loss']:.4f}")

if __name__ == "__main__":
    train(
        model_dir="/home/raw/Desktop/Coding/military_int_icc/shakti-2B-041224",
        data_path="/home/raw/Desktop/Coding/military_int_icc/airavata-framework/training-pipeline/dataset_training.json",
        output_dir="/home/raw/Desktop/Coding/military_int_icc/airavata-framework/training-pipeline/lora_weights",
        mode="full",  # 'full' or 'vision' or 'text'
        batch_size=4,
        num_epochs=5
    )