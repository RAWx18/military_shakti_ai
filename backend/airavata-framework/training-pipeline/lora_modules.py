import torch
import torch.nn as nn

class LoRALinear(nn.Module):
    def __init__(self, linear_layer, rank=16, scaling=1.0):
        super().__init__()
        self.in_features = linear_layer.in_features
        self.out_features = linear_layer.out_features
        self.lora_A = nn.Parameter(torch.randn(rank, self.in_features) * 0.02)
        self.lora_B = nn.Parameter(torch.zeros(self.out_features, rank))
        self.scaling = scaling
        self.linear = linear_layer
        self.linear.requires_grad_(False)

    def forward(self, x):
        return self.linear(x) + (x @ self.lora_A.T @ self.lora_B.T) * self.scaling

class ModularLoRAAdapter:
    """Handles different LoRA adapters for vision, text, and multimodal paths"""
    
    def __init__(self, model, rank=16):
        self.rank = rank
        
        # Vision path LoRA - Updated for SiglipVisionTransformer structure
        self.vision_layers = {
            'vision2text': model.vision2text_model,
            'vision_attention': model.vision_model.encoder.layers[-1].layer_norm1,  # Changed this line
            'vision_mlp': model.vision_model.encoder.layers[-1].mlp  # Added MLP layer
        }
        
        # Text path LoRA 
        self.text_layers = {
            layer_idx: layer.self_attn
            for layer_idx, layer in enumerate(model.language_model.model.layers)
            if not layer.is_hyper_enabled  # Non-hyper layers
        }
        
        # Multimodal path LoRA
        self.multimodal_layers = {
            layer_idx: layer.self_attn
            for layer_idx, layer in enumerate(model.language_model.model.layers)
            if layer.is_hyper_enabled  # Hyper attention layers
        }

    def add_vision_lora(self, model):
        """Add LoRA to vision pathway"""
        for name, layer in self.vision_layers.items():
            if name == 'vision2text' and isinstance(layer, nn.Linear):
                setattr(model, name, LoRALinear(layer, self.rank))
            elif name == 'vision_attention':
                # Add LoRA to attention QKV projections
                if hasattr(layer, 'qkv'):
                    layer.qkv = LoRALinear(layer.qkv, self.rank)
                if hasattr(layer, 'proj'):
                    layer.proj = LoRALinear(layer.proj, self.rank)
            elif name == 'vision_mlp':
                # Add LoRA to MLP layers
                if hasattr(layer, 'fc1'):
                    layer.fc1 = LoRALinear(layer.fc1, self.rank)
                if hasattr(layer, 'fc2'):
                    layer.fc2 = LoRALinear(layer.fc2, self.rank)
        return model


    def add_text_lora(self, model):
        """Add LoRA to text pathway"""
        for _, attn in self.text_layers.items():
            attn.q_proj = LoRALinear(attn.q_proj, self.rank)
            attn.k_proj = LoRALinear(attn.k_proj, self.rank)
            attn.v_proj = LoRALinear(attn.v_proj, self.rank)
            attn.o_proj = LoRALinear(attn.o_proj, self.rank)
        return model

    def add_multimodal_lora(self, model):
        """Add LoRA to multimodal fusion pathway"""
        for _, attn in self.multimodal_layers.items():
            attn.v_kv_proj = LoRALinear(attn.v_kv_proj, self.rank)
            attn.gate = nn.Parameter(attn.gate.clone())  # Make gate trainable
        return model