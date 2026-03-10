'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  MapPin,
  Phone,
  User,
  CreditCard,
  QrCode,
  Wallet,
  CheckCircle2,
  ArrowLeft,
  Truck,
  Clock,
} from 'lucide-react'
import { motion } from 'framer-motion'

// Types
interface Product {
  id: string
  name: string
  description?: string
  price: number
  category: string
  image?: string
  isPopular?: boolean
  isPromo?: boolean
  discountPercent?: number
  rating?: number
  spicyLevel?: number
}

interface CartItem {
  product: Product
  quantity: number
}

interface CheckoutViewProps {
  cart: CartItem[]
  onBack: () => void
  onOrderComplete: () => void
}

const deliveryOptions = [
  { id: 'pickup', name: 'Ambil Sendiri', price: 0, time: '15-20 menit', icon: Truck },
  { id: 'delivery', name: 'Pengiriman', price: 5000, time: '30-45 menit', icon: Clock },
]

const paymentMethods = [
  { id: 'cash', name: 'Tunai (Bayar di Tempat)', icon: Wallet },
  { id: 'qris', name: 'QRIS', icon: QrCode },
  { id: 'card', name: 'Kartu Debit/Kredit', icon: CreditCard },
]

export default function CheckoutView({ cart, onBack, onOrderComplete }: CheckoutViewProps) {
  const [selectedDelivery, setSelectedDelivery] = useState('pickup')
  const [selectedPayment, setSelectedPayment] = useState('cash')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  // Handle undefined cart
  const safeCart = cart || []

  // Calculations
  const subtotal = safeCart.reduce((sum, item) => {
    const price = item.product.discountPercent
      ? item.product.price * (1 - item.product.discountPercent / 100)
      : item.product.price
    return sum + price * item.quantity
  }, 0)

  const deliveryFee = selectedDelivery === 'delivery' ? deliveryOptions[1].price : 0
  const total = subtotal + deliveryFee

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getDiscountedPrice = (product: Product) => {
    if (product.discountPercent) {
      return product.price * (1 - product.discountPercent / 100)
    }
    return product.price
  }

  const handlePlaceOrder = async () => {
    if (!customerName || !customerPhone) {
      alert('Mohon lengkapi nama dan nomor telepon')
      return
    }

    if (selectedDelivery === 'delivery' && !deliveryAddress) {
      alert('Mohon isi alamat pengiriman')
      return
    }

    setIsProcessing(true)

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate order number
    const newOrderNumber = `AG${Date.now().toString().slice(-8)}`
    setOrderNumber(newOrderNumber)

    setIsProcessing(false)
    setOrderSuccess(true)
  }

  const handleCloseSuccess = () => {
    setOrderSuccess(false)
    onOrderComplete()
  }

  if (safeCart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-xl font-bold mb-2">Keranjang Kosong</h2>
              <p className="text-gray-500 mb-6">
                Anda belum memiliki item di keranjang
              </p>
              <Button onClick={onBack} className="w-full">
                Kembali ke Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Checkout</h1>
              <p className="text-sm text-gray-500">
                {safeCart.reduce((sum, item) => sum + item.quantity, 0)} item di keranjang
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Pelanggan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Lengkap *</Label>
                  <Input
                    id="name"
                    placeholder="Masukkan nama lengkap"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Nomor Telepon *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="mt-1 pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Option */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Metode Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedDelivery} onValueChange={setSelectedDelivery}>
                  <div className="grid gap-4">
                    {deliveryOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <div
                          key={option.id}
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedDelivery === option.id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedDelivery(option.id)}
                        >
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <Label
                                  htmlFor={option.id}
                                  className="font-semibold cursor-pointer flex items-center gap-2"
                                >
                                  <Icon className="h-4 w-4" />
                                  {option.name}
                                </Label>
                                <span className="font-bold text-green-600">
                                  {option.price === 0 ? 'Gratis' : formatCurrency(option.price)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Estimasi: {option.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </RadioGroup>

                {/* Delivery Address */}
                {selectedDelivery === 'delivery' && (
                  <div className="mt-4">
                    <Label htmlFor="address">Alamat Pengiriman *</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="address"
                        placeholder="Masukkan alamat lengkap pengiriman"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="pl-10 min-h-[100px]"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Metode Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                  <div className="grid gap-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon
                      return (
                        <div
                          key={method.id}
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedPayment === method.id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedPayment(method.id)}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label
                            htmlFor={method.id}
                            className="flex-1 cursor-pointer flex items-center gap-2"
                          >
                            <Icon className="h-4 w-4" />
                            {method.name}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Catatan Tambahan</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Contoh: Sambal jangan terlalu pedas, tambah es teh, dll."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {safeCart.map((item) => {
                      const discountedPrice = getDiscountedPrice(item.product)
                      return (
                        <div key={item.product.id} className="flex gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <span className="text-2xl">🍗</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-gray-500">x{item.quantity}</p>
                            <p className="text-sm font-semibold text-green-600 mt-1">
                              {formatCurrency(discountedPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Biaya Pengiriman</span>
                    <span>{deliveryFee === 0 ? 'Gratis' : formatCurrency(deliveryFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4 h-12 text-lg bg-green-600 hover:bg-green-700"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Buat Pesanan
                    </span>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500 mt-3">
                  Dengan memesan, Anda menyetujui Syarat & Ketentuan kami
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Success Dialog */}
      <Dialog open={orderSuccess} onOpenChange={setOrderSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Pesanan Berhasil!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Terima Kasih!</h3>
            <p className="text-gray-600 mb-4">
              Pesanan Anda telah diterima dan sedang diproses
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500">Nomor Pesanan</p>
              <p className="text-2xl font-bold text-green-600">{orderNumber}</p>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                Estimasi: {selectedDelivery === 'delivery' ? '30-45' : '15-20'} menit
              </p>
              <p className="flex items-center justify-center gap-2">
                <Truck className="h-4 w-4" />
                {selectedDelivery === 'delivery' ? 'Akan diantar' : 'Siap diambil'}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseSuccess} className="flex-1">
              Kembali ke Menu
            </Button>
            <Button onClick={handleCloseSuccess} className="flex-1 bg-green-600 hover:bg-green-700">
              Lacak Pesanan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
