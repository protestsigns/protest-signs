import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (
        email,
        full_name
      ),
      order_items (
        quantity,
        price_at_purchase,
        signs (
          title
        )
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold mb-8">Orders</h2>

      <div className="space-y-6">
        {orders?.map((order: any) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  Order #{order.id.slice(0, 8)}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Customer: {order.profiles?.email}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatPrice(order.total)}</p>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {order.status}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Items</h4>
              <ul className="space-y-2">
                {order.order_items.map((item: any, index: number) => (
                  <li key={index} className="flex justify-between text-sm">
                    <span>
                      {item.signs?.title} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.price_at_purchase * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
