import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Package } from 'lucide-react';

export function Products() {
  const products = [
    { 
      id: 1, 
      name: 'Producto Premium A', 
      category: 'Electrónica', 
      price: '€299.99', 
      stock: 45,
      status: 'En Stock'
    },
    { 
      id: 2, 
      name: 'Producto Estándar B', 
      category: 'Hogar', 
      price: '€149.99', 
      stock: 23,
      status: 'En Stock'
    },
    { 
      id: 3, 
      name: 'Producto Especial C', 
      category: 'Deportes', 
      price: '€89.99', 
      stock: 5,
      status: 'Bajo Stock'
    },
    { 
      id: 4, 
      name: 'Producto Pro D', 
      category: 'Oficina', 
      price: '€199.99', 
      stock: 0,
      status: 'Agotado'
    },
    { 
      id: 5, 
      name: 'Producto Básico E', 
      category: 'Accesorios', 
      price: '€49.99', 
      stock: 120,
      status: 'En Stock'
    },
    { 
      id: 6, 
      name: 'Producto Elite F', 
      category: 'Premium', 
      price: '€499.99', 
      stock: 12,
      status: 'En Stock'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En Stock':
        return 'default';
      case 'Bajo Stock':
        return 'secondary';
      case 'Agotado':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-gray-900 mb-2">Productos</h2>
          <p className="text-gray-600">Gestiona tu inventario de productos</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Añadir Producto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Package className="w-8 h-8" />
              </div>
              <Badge variant={getStatusColor(product.status)}>
                {product.status}
              </Badge>
            </div>

            <h3 className="text-gray-900 mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-4">{product.category}</p>

            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-900">{product.price}</span>
              <span className="text-gray-600">Stock: {product.stock}</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Editar
              </Button>
              <Button variant="outline" className="flex-1">
                Ver
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
