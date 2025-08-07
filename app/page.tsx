'use client'

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

  return (
    <div>
      <div className="btn btn-sm">Test</div>
    </div>
  )
}
