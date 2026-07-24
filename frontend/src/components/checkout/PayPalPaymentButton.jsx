import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { paymentAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function PayPalPaymentButton({ orderId, onPaid }) {
  return (
    <PayPalScriptProvider options={{ clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test', currency: 'USD' }}>
      <PayPalButtons
        style={{ layout: 'vertical', color: 'black', shape: 'rect', label: 'pay' }}
        createOrder={async () => {
          const { data } = await paymentAPI.paypalCreateOrder(orderId)
          return data.paypalOrderId
        }}
        onApprove={async (data) => {
          try {
            await paymentAPI.paypalCaptureOrder(data.orderID, orderId)
            onPaid()
          } catch (err) {
            toast.error(err.response?.data?.message || 'PayPal payment could not be completed.')
          }
        }}
        onError={() => toast.error('PayPal payment failed. Please try again.')}
      />
    </PayPalScriptProvider>
  )
}
