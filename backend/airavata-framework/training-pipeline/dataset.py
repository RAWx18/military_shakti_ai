import json
from PIL import Image
from torch.utils.data import Dataset, DataLoader
import os
import torch
from sklearn.model_selection import train_test_split
import logging
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime

class UnifiedDataset(Dataset):
    def __init__(self, json_path, processor, mode='full', split='train', test_size=0.2, val_size=0.1):
        self.processor = processor
        self.mode = mode
        self.split = split
        
        # Load data with error checking
        try:
            with open(json_path, 'r') as f:
                all_data = json.load(f)
        except Exception as e:
            logging.error(f"Error loading dataset from {json_path}: {str(e)}")
            all_data = []

        logging.info(f"Loaded {len(all_data)} total samples from dataset")
        
        # Filter data for the current mode
        filtered_data = self.filter_and_load_data(all_data)
        logging.info(f"Found {len(filtered_data)} samples for mode: {mode}")
        
        if len(filtered_data) == 0:
            logging.warning(f"No valid data found for mode: {mode}")
            self.data = []
            return
            
        # Split data
        if len(filtered_data) < 3:
            logging.warning(f"Very small dataset ({len(filtered_data)} samples). Using same data for all splits.")
            self.data = filtered_data
        else:
            # Split into train/val/test
            try:
                train_size = max(1, int((1 - test_size - val_size) * len(filtered_data)))
                val_size = max(1, int(val_size * len(filtered_data)))
                test_size = len(filtered_data) - train_size - val_size
                
                indices = list(range(len(filtered_data)))
                
                if split == 'train':
                    split_indices = indices[:train_size]
                elif split == 'val':
                    split_indices = indices[train_size:train_size + val_size]
                else:  # test
                    split_indices = indices[train_size + val_size:]
                    
                self.data = [filtered_data[i] for i in split_indices]
                
            except Exception as e:
                logging.error(f"Error splitting dataset: {str(e)}")
                self.data = filtered_data  # Fallback to using all data
                
        logging.info(f"Final {split} split size: {len(self.data)} samples")

    def filter_and_load_data(self, data):
        filtered_data = []
        for item in data:
            try:
                if self.mode in ['vision', 'full']:
                    if isinstance(item.get('image'), str):
                        if os.path.exists(item['image']):
                            item['image'] = Image.open(item['image']).convert('RGB')
                            filtered_data.append(item)
                            logging.info(f"Successfully loaded image: {item['image']}")
                elif self.mode == 'text':
                    if item.get('query') and item.get('response'):
                        filtered_data.append(item)
            except Exception as e:
                logging.error(f"Error processing item: {e}")
                continue
        
        logging.info(f"Successfully loaded {len(filtered_data)} items")
        return filtered_data

    def __len__(self):
        return max(len(self.data), 1)  # Always return at least 1

    def __getitem__(self, idx):
        if not self.data:
            return self.get_dummy_item()
                
        idx = idx % len(self.data)
        item = self.data[idx]
        
        try:
            if self.mode == 'vision':
                messages = [
                    {"role": "user", "content": "<|image|>\nDescribe the main object in this image."},
                    {"role": "assistant", "content": item.get("response", "")}
                ]
            elif self.mode == 'text':
                messages = [
                    {"role": "user", "content": item.get("query", "")},
                    {"role": "assistant", "content": item.get("response", "")}
                ]
            else:  # full
                messages = [
                    {"role": "user", "content": f"<|image|>\n{item.get('query', '')}"},
                    {"role": "assistant", "content": item.get("response", "")}
                ]
            
            # Process inputs
            inputs = self.processor(
                messages=messages,
                images=[item.get("image")] if item.get("image") is not None else None
            )
            
            # Ensure correct pixel_values shape
            if 'pixel_values' in inputs and inputs['pixel_values'] is not None:
                pixel_values = inputs['pixel_values']
                if len(pixel_values.shape) == 3:  # [C, H, W]
                    pixel_values = pixel_values.unsqueeze(0)  # Add batch dim
                elif len(pixel_values.shape) == 5:  # [1, 1, C, H, W]
                    pixel_values = pixel_values.squeeze(0).squeeze(0)  # Remove extra dims
                # Ensure final shape is [C, H, W]
                pixel_values = pixel_values.view(3, 384, 384)
                inputs['pixel_values'] = pixel_values
                
            return inputs
                
        except Exception as e:
            logging.error(f"Error processing item {idx}: {str(e)}")
            return self.get_dummy_item()

    def get_dummy_item(self):
        """Return a dummy item with correct tensor shapes"""
        if self.mode == 'vision' or self.mode == 'full':
            dummy_image = Image.new('RGB', (384, 384), color='gray')
            messages = [
                {"role": "user", "content": "<|image|>\nDescribe this image."},
                {"role": "assistant", "content": "This is a placeholder image."}
            ]
            inputs = self.processor(messages=messages, images=[dummy_image])
            
            if 'pixel_values' in inputs:
                inputs['pixel_values'] = inputs['pixel_values'].view(3, 384, 384)
            return inputs
        else:
            messages = [
                {"role": "user", "content": "Placeholder query"},
                {"role": "assistant", "content": "Placeholder response"}
            ]
            return self.processor(messages=messages, images=None)
    
class TrainingLogger:
    def __init__(self, log_dir, mode):
        self.log_dir = log_dir
        self.mode = mode
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create directories
        self.run_dir = os.path.join(log_dir, f"{mode}_{self.timestamp}")
        os.makedirs(self.run_dir, exist_ok=True)
        
        # Initialize metrics storage
        self.metrics = {
            'train_loss': [],
            'val_loss': [],
            'train_acc': [],
            'val_acc': [],
            'epoch': []
        }
        
        # Setup logging
        logging.basicConfig(
            filename=os.path.join(self.run_dir, 'training.log'),
            level=logging.INFO,
            format='%(asctime)s - %(message)s'
        )

    def log_epoch(self, epoch, train_metrics, val_metrics):
        self.metrics['epoch'].append(epoch)
        self.metrics['train_loss'].append(train_metrics['loss'])
        self.metrics['val_loss'].append(val_metrics['loss'])
        self.metrics['train_acc'].append(train_metrics.get('accuracy', 0))
        self.metrics['val_acc'].append(val_metrics.get('accuracy', 0))
        
        # Log to file
        logging.info(f"Epoch {epoch}:")
        logging.info(f"Train Loss: {train_metrics['loss']:.4f}, Val Loss: {val_metrics['loss']:.4f}")
        if 'accuracy' in train_metrics:
            logging.info(f"Train Acc: {train_metrics['accuracy']:.4f}, Val Acc: {val_metrics['accuracy']:.4f}")

        # Save metrics to CSV
        pd.DataFrame(self.metrics).to_csv(
            os.path.join(self.run_dir, 'metrics.csv'),
            index=False
        )
        
        # Plot metrics
        self.plot_metrics()

    def plot_metrics(self):
        plt.figure(figsize=(12, 5))
        
        # Loss plot
        plt.subplot(1, 2, 1)
        plt.plot(self.metrics['epoch'], self.metrics['train_loss'], label='Train Loss')
        plt.plot(self.metrics['epoch'], self.metrics['val_loss'], label='Val Loss')
        plt.title('Loss vs Epoch')
        plt.xlabel('Epoch')
        plt.ylabel('Loss')
        plt.legend()
        
        # Accuracy plot
        plt.subplot(1, 2, 2)
        plt.plot(self.metrics['epoch'], self.metrics['train_acc'], label='Train Acc')
        plt.plot(self.metrics['epoch'], self.metrics['val_acc'], label='Val Acc')
        plt.title('Accuracy vs Epoch')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()
        
        plt.tight_layout()
        plt.savefig(os.path.join(self.run_dir, 'training_curves.png'))
        plt.close()

def create_dataloaders(data_path, processor, mode, batch_size=4):
    datasets = {
        split: UnifiedDataset(data_path, processor, mode=mode, split=split)
        for split in ['train', 'val', 'test']
    }
    
    def collate_fn(batch):
        collated = {}
        
        # First, collect all pixel values and other items
        for key in batch[0].keys():
            if key == 'pixel_values':
                # Get all pixel values, filtering out None
                pixel_values = [item[key] for item in batch if item[key] is not None]
                if pixel_values:
                    # Stack and ensure shape is [B, C, H, W]
                    pixel_values = torch.stack(pixel_values)
                    # Reshape if necessary
                    if len(pixel_values.shape) != 4:
                        pixel_values = pixel_values.view(-1, 3, 384, 384)
                    collated[key] = pixel_values
            else:
                # Handle other batch items
                if isinstance(batch[0][key], torch.Tensor):
                    collated[key] = torch.stack([item[key] for item in batch])
                elif isinstance(batch[0][key], list):
                    collated[key] = [item[key] for item in batch]
                else:
                    collated[key] = [item[key] for item in batch]

        return collated

    dataloaders = {
        split: DataLoader(
            dataset,
            batch_size=batch_size,
            shuffle=(split == 'train'),
            collate_fn=collate_fn,
            drop_last=True  # Add this to ensure consistent batch sizes
        )
        for split, dataset in datasets.items()
    }
    
    return dataloaders