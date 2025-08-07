'use client'

import { Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from './api'

type Transaction = {
  id: string
  text: string
  amount: number
  createdAt: string
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const getTransactions = async () => {
    try {
      const res = await api.get<Transaction[]>('transactions/')
      setTransactions(res.data)
      toast.success('Transactions fetched successfully')
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to fetch transactions')
    }
  }

  useEffect(() => {
    getTransactions()
  }, [])

  const amounts = transactions.map((t) => Number(t.amount) || 0)
  const balance = amounts.reduce((acc, item) => acc + item, 0) || 0
  const income =
    amounts.filter((a) => a > 0).reduce((acc, item) => acc + item, 0) || 0
  const expense =
    amounts.filter((a) => a < 0).reduce((acc, item) => acc + item, 0) || 0
  const ratio =
    income > 0 ? Math.min((Math.abs(expense) / income) * 100, 100) : 0

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d
      .toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      .replace(',', '')
  }

  return (
    <div className="w-2/3 flex flex-col gap-4">
      <div className="flex justify-between rounded-2xl border-2 border-dashed border-yellow-500/10 bg-yellow-500/5 p-6">
        <div className="flex flex-col gap-1">
          <div className="badge badge-soft">
            <Wallet className="w-4 h-4" />
            Balance
          </div>
        </div>
        <div className="text-4xl font-bold text-white">
          {balance.toFixed(2)} $
        </div>
      </div>
    </div>
  )
}
