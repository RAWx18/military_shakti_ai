from lora_modules import ModularLoRAAdapter
import torch
import copy

class ModularShaktiTrainer:
    def __init__(self, 
                 model,
                 tokenizer,
                 train_mode: str = 'full',  # 'vision', 'text', or 'full'
                 lora_rank: int = 16,
                 temperature: float = 2.0,
                 kd_alpha: float = 0.3,
                 learning_rate: float = 1e-4):  # Add this parameter
        
        self.train_mode = train_mode
        self.temperature = temperature
        self.kd_alpha = kd_alpha
        
        # Initialize base model
        self.model = model #.cuda()
        self.tokenizer = tokenizer
        self.processor = model.init_processor(tokenizer)
        
        # Setup LoRA
        self.lora_adapter = ModularLoRAAdapter(model, lora_rank)
        
        # Freeze base model
        for param in model.parameters():
            param.requires_grad = False
            
        # Add appropriate LoRA layers based on mode
        if train_mode == 'vision':
            self.model = self.lora_adapter.add_vision_lora(self.model)
        elif train_mode == 'text':
            self.model = self.lora_adapter.add_text_lora(self.model)
        else:  # full
            self.model = self.lora_adapter.add_vision_lora(self.model)
            self.model = self.lora_adapter.add_text_lora(self.model)
            self.model = self.lora_adapter.add_multimodal_lora(self.model)
            
        # Create teacher model
        self.teacher_model = copy.deepcopy(model).eval() #.cuda()
        
        # Initialize optimizer with the provided learning rate
        self.optimizer = torch.optim.AdamW(
            [p for p in self.model.parameters() if p.requires_grad],
            lr=learning_rate  # Use the provided learning rate
        )

    def compute_kd_loss(self, student_logits, teacher_logits):
        """Compute knowledge distillation loss"""
        soft_targets = torch.nn.functional.softmax(
            teacher_logits / self.temperature, dim=-1
        )
        return torch.nn.functional.kl_div(
            torch.nn.functional.log_softmax(student_logits / self.temperature, dim=-1),
            soft_targets,
            reduction='batchmean'
        ) * (self.temperature ** 2)

    def train_step(self, batch):
        # Get teacher predictions
        with torch.no_grad():
            teacher_outputs = self.teacher_model(**batch)
            
        # Forward pass
        student_outputs = self.model(**batch)
        
        # Task loss
        task_loss = student_outputs.loss
        
        # Knowledge distillation loss
        kd_loss = self.compute_kd_loss(
            student_outputs.logits,
            teacher_outputs.logits
        )
        
        # Combined loss
        total_loss = (1 - self.kd_alpha) * task_loss + self.kd_alpha * kd_loss
        
        # Backward pass
        self.optimizer.zero_grad()
        total_loss.backward()
        self.optimizer.step()
        
        return {
            'total_loss': total_loss.item(),
            'task_loss': task_loss.item(),
            'kd_loss': kd_loss.item()
        }

    def save_lora_weights(self, output_dir: str):
        """Save LoRA weights based on training mode"""
        state_dict = {
            name: param for name, param in self.model.state_dict().items()
            if param.requires_grad
        }
        torch.save(state_dict, f"{output_dir}/{self.train_mode}_lora.pt")
