"""
This file contains intentionally complex code to test code complexity analysis.
"""
from typing import List, Dict, Any, Optional, Union, Tuple
import re
import math

class ComplexProcessor:
    """A class with high complexity methods for testing purposes."""
    
    def __init__(self, data: List[Dict[str, Any]]):
        self.data = data
        self._processed_data = {}
        self._cache = {}
    
    def process_data(self, threshold: int = 10) -> Dict[str, List[Any]]:
        """Process data with multiple nested conditions and loops."""
        result = {
            'high': [],
            'medium': [],
            'low': []
        }
        
        for item in self.data:
            if not item or 'value' not in item:
                continue
                
            value = item['value']
            category = self._categorize_value(value, threshold)
            
            if category == 'high':
                processed = self._process_high_value(item)
                result['high'].append(processed)
            elif category == 'medium':
                processed = self._process_medium_value(item)
                result['medium'].append(processed)
            else:
                processed = self._process_low_value(item)
                result['low'].append(processed)
                
            # Additional processing based on item type
            if 'type' in item:
                self._process_by_type(item, result)
                
        return result
    
    def _categorize_value(self, value: Union[int, float, str], threshold: int) -> str:
        """Categorize value into high, medium, or low."""
        try:
            num = float(value)
            if num > threshold * 2:
                return 'high'
            elif num > threshold:
                return 'medium'
            return 'low'
        except (ValueError, TypeError):
            if isinstance(value, str) and len(value) > 10:
                return 'high' if len(value) > 20 else 'medium'
            return 'low'
    
    def _process_high_value(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Process high value items with complex logic."""
        result = item.copy()
        
        # Complex processing based on multiple conditions
        if 'tags' in item and isinstance(item['tags'], list):
            result['tag_count'] = len(item['tags'])
            result['has_priority'] = any(tag.get('priority') for tag in item['tags'])
            
            # Nested loop with condition
            for tag in item['tags']:
                if isinstance(tag, dict) and 'category' in tag:
                    result.setdefault('categories', set()).add(tag['category'])
        
        # Complex string manipulation
        if 'description' in item and isinstance(item['description'], str):
            # Count words longer than 5 characters
            words = re.findall(r'\b\w{6,}\b', item['description'])
            result['long_word_count'] = len(words)
            
            # Check for specific patterns
            patterns = [r'\b(?:critical|important|urgent)\b', r'\b(?:high|medium|low)\b']
            for pattern in patterns:
                if re.search(pattern, item['description'], re.IGNORECASE):
                    result['has_priority_keywords'] = True
                    break
        
        # Complex mathematical operation
        if 'value' in item and isinstance(item['value'], (int, float)):
            result['factorial'] = self._calculate_factorial(int(abs(item['value'])) % 10)
            
        return result
    
    def _process_medium_value(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Process medium value items with moderate complexity."""
        result = item.copy()
        
        if 'metadata' in item and isinstance(item['metadata'], dict):
            result['metadata'] = {k.upper(): str(v) for k, v in item['metadata'].items()}
            
            # Nested dictionary processing
            for key, value in item['metadata'].items():
                if isinstance(value, dict) and 'nested' in value:
                    result['has_nested'] = True
                    break
                    
        return result
    
    def _process_low_value(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Process low value items with simple logic."""
        result = item.copy()
        result['processed'] = True
        return result
    
    def _process_by_type(self, item: Dict[str, Any], result: Dict[str, List[Any]]) -> None:
        """Process item based on its type with complex pattern matching."""
        item_type = item['type'].lower()
        
        if item_type == 'user':
            if 'username' in item and 'email' in item:
                result.setdefault('users', []).append({
                    'username': item['username'],
                    'email': item['email'],
                    'is_valid': self._validate_email(item['email'])
                })
        elif item_type == 'product':
            if 'price' in item and 'quantity' in item:
                total = item['price'] * item['quantity']
                result.setdefault('products', []).append({
                    'name': item.get('name', 'Unknown'),
                    'total': total,
                    'discounted': self._apply_discount(total, item.get('discount', 0))
                })
    
    def _validate_email(self, email: str) -> bool:
        """Validate email with regex."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def _apply_discount(self, amount: float, discount: float) -> float:
        """Apply discount with validation."""
        if 0 <= discount <= 100:
            return amount * (1 - discount / 100)
        return amount
    
    def _calculate_factorial(self, n: int) -> int:
        """Calculate factorial with memoization."""
        if n in self._cache:
            return self._cache[n]
            
        if n == 0 or n == 1:
            result = 1
        else:
            result = n * self._calculate_factorial(n - 1)
            
        self._cache[n] = result
        return result


def process_complex_data(data: List[Dict[str, Any]], 
                       config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Process complex data with multiple transformations."""
    if not data:
        return {}
        
    config = config or {}
    processor = ComplexProcessor(data)
    result = processor.process_data(threshold=config.get('threshold', 10))
    
    # Additional post-processing
    for category in result:
        if category in ['high', 'medium', 'low']:
            result[f'{category}_count'] = len(result[category])
    
    return result


if __name__ == "__main__":
    # Example usage
    sample_data = [
        {'type': 'user', 'username': 'john_doe', 'email': 'john@example.com', 'value': 15},
        {'type': 'product', 'name': 'Laptop', 'price': 999.99, 'quantity': 2, 'discount': 10, 'value': 25},
        {'type': 'order', 'order_id': '12345', 'value': 5, 'tags': [{'name': 'electronics', 'category': 'tech'}]},
        {'type': 'user', 'username': 'jane_doe', 'email': 'jane@example', 'value': 8},
        {'type': 'product', 'name': 'Phone', 'price': 699.99, 'quantity': 1, 'value': 30},
    ]
    
    result = process_complex_data(sample_data)
    print("Processing complete. Results:")
    print(f"- High value items: {result.get('high_count', 0)}")
    print(f"- Medium value items: {result.get('medium_count', 0)}")
    print(f"- Low value items: {result.get('low_count', 0)}")
    
    if 'users' in result:
        print("\nUser validation results:")
        for user in result['users']:
            status = "valid" if user['is_valid'] else "invalid"
            print(f"- {user['username']} ({user['email']}): {status}")
