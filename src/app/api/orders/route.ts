import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, name, address, phone, paymentMethod, cartItems, total } = await request.json();

    console.log('Received order data:', { email, name, address, phone, paymentMethod, cartItems, total });

    // Check if customer already exists, if not create a new one
    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email,
          name,
          address,
          phone,
        },
      });
      console.log('Created new customer:', customer);
    } else {
      console.log('Found existing customer:', customer);
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        totalAmount: total,
        paymentMethod: paymentMethod || 'cash_on_delivery',
        status: 'pending',
      },
    });
    console.log('Created order:', order);

    // Create order items
    for (const item of cartItems) {
      const orderItem = await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        },
      });
      console.log('Created order item:', orderItem);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        orderId: order.id,
        message: 'Order placed successfully!' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error placing order:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Failed to place order. Please try again. Error: ' + (error instanceof Error ? error.message : String(error))
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}