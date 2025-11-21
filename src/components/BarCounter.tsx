import React from 'react';
import { useCart } from '../hooks/useCart';
import Header from './Header';
import DesktopNav from './DesktopNav';
import Menu from './Menu';
import Cart from './Cart';
import BarCounterCheckout from './BarCounterCheckout';
import { useMenu } from '../hooks/useMenu';

const BarCounter: React.FC = () => {
  const cart = useCart();
  const { menuItems } = useMenu();
  const [currentView, setCurrentView] = React.useState<'menu' | 'cart' | 'checkout'>('menu');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const handleViewChange = (view: 'menu' | 'cart' | 'checkout') => {
    setCurrentView(view);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Filter menu items based on selected category
  const filteredMenuItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const handleOrderComplete = () => {
    // Clear cart and refresh page
    cart.clearCart();
    window.location.href = '/barcounter';
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header 
        cartItemsCount={cart.getTotalItems()}
        onCartClick={() => handleViewChange('cart')}
        onMenuClick={() => handleViewChange('menu')}
        onOrderTrackingClick={undefined} // Not needed for bar counter
      />
      
      {currentView === 'menu' && (
        <>
          <DesktopNav 
            selectedCategory={selectedCategory}
            onCategoryClick={handleCategoryClick}
          />
          <Menu 
            menuItems={filteredMenuItems}
            addToCart={cart.addToCart}
            cartItems={cart.cartItems}
            updateQuantity={cart.updateQuantity}
          />
        </>
      )}
      
      {currentView === 'cart' && (
        <Cart 
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          removeFromCart={cart.removeFromCart}
          clearCart={cart.clearCart}
          getTotalPrice={cart.getTotalPrice}
          onContinueShopping={() => handleViewChange('menu')}
          onCheckout={() => handleViewChange('checkout')}
        />
      )}
      
      {currentView === 'checkout' && (
        <BarCounterCheckout 
          cartItems={cart.cartItems}
          totalPrice={cart.getTotalPrice()}
          onBack={() => handleViewChange('cart')}
          onOrderComplete={handleOrderComplete}
        />
      )}
    </div>
  );
};

export default BarCounter;

