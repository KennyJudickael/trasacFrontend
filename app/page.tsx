'use client'

import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  Pencil,
  PlusCircle,
  Trash,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import api from './api'

type Transaction = {
  id: string
  text: string
  amount: number
  created_at: string
}

export default function Home() {
  const hasFetchedOnce = useRef(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [text, setText] = useState<string>('')
  const [amount, setAmount] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    const modal = document.getElementById('edit_modal') as HTMLDialogElement
    if (modal) modal.showModal()
  }

  const getTransactions = async () => {
    try {
      const res = await api.get<Transaction[]>('transactions/')
      setTransactions(res.data)

      // ✅ Affiche le toast uniquement au premier chargement
      if (!hasFetchedOnce.current) {
        toast.success('Transactions fetched successfully')
        hasFetchedOnce.current = true
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to fetch transactions')
    }
  }

  const updateTransaction = async () => {
    if (!editingTransaction?.text || isNaN(Number(editingTransaction.amount))) {
      toast.error('Please fill all fields correctly')
      return
    }

    setLoading(true)
    try {
      await api.put(`transactions/${editingTransaction.id}/`, {
        text: editingTransaction.text,
        amount: editingTransaction.amount
      })
      toast.success('Transaction updated successfully')
      getTransactions()
      const modal = document.getElementById('edit_modal') as HTMLDialogElement
      if (modal) modal.close()
      setEditingTransaction(null)
    } catch (error) {
      console.error('Error updating transaction:', error)
      toast.error('Failed to update transaction')
    } finally {
      setLoading(false)
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      await api.delete(`transactions/${id}/`)
      getTransactions() // Refresh the list after deletion
      toast.success('Transactions deleted successfully')
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to delete the transaction')
    }
  }

  const addTransaction = async () => {
    if (!text || amount === '' || isNaN(Number(amount))) {
      toast.error('Please fill the following fields')
      return
    }

    const modal = document.getElementById('my_modal_3') as HTMLDialogElement
    const amountNumber = Number(amount)

    // ❗ Si c'est une dépense négative et qu'elle dépasse le solde
    if (amountNumber < 0 && Math.abs(amountNumber) > balance) {
      if (modal) modal.close()
      toast.error('La dépense dépasse le solde disponible')
      return
    }

    setLoading(true)
    try {
      await api.post<Transaction>('transactions/', {
        text,
        amount: amountNumber
      })
      await getTransactions() // Refresh list
      if (modal) modal.close()
      toast.success('Transaction ajoutée avec succès')
      setAmount('')
      setText('')
    } catch (error) {
      console.error('Erreur lors de l’ajout :', error)
      toast.error('Échec de l’ajout de la transaction')
    } finally {
      setLoading(false)
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

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Invalid Date'

    const parsedDate = new Date(dateString)

    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Date'
    }

    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', // e.g., "Aug"
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Si tu veux du format 24h (par ex. "13:45")
      timeZone: 'UTC' // Facultatif : garde le temps en UTC si nécessaire
    })
  }

  return (
    <div className="w-2/3 flex flex-col gap-4">
      <div className="flex justify-between rounded-2xl border-2 border-warning/10 border-dashed bg-warning/5 p-5">
        <div className="flex flex-col gap-1">
          <div className="badge badge-soft">
            <Wallet className="w-4 h-4" />
            Balance
          </div>
          <div className="text-4xl font-bold text-white">
            {balance.toFixed(2)} $
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="badge badge-soft badge-success">
            <ArrowUpCircle className="w-4 h-4" />
            Income
          </div>
          <div className="text-4xl font-bold text-white">
            {income.toFixed(2)} $
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="badge badge-soft badge-error">
            <ArrowDownCircle className="w-4 h-4" />
            Expense
          </div>
          <div className="text-4xl font-bold text-white">
            {expense.toFixed(2)} $
          </div>
        </div>
      </div>

      <div className="border-2 border-warning/10 border-dashed bg-warning/5 p-5">
        <div className="flex justify-between items-center mb-1">
          <div className="badge badge-soft badge-warning gap-1">
            <Activity className="w-4 h-4" />
            Income vs Expence ratio
          </div>
          <div>{ratio.toFixed(0)}%</div>
        </div>
        <progress
          className="progress progress-warning w-full"
          value={ratio}
          max="100"
        ></progress>
      </div>

      {/* You can open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="btn btn-warning "
        onClick={() =>
          (
            document.getElementById('my_modal_3') as HTMLDialogElement
          ).showModal()
        }
      >
        <PlusCircle className="w-4 h-4" />
        Create Transaction
      </button>

      <div className="overflow-x-auto border-2 border-warning/10 border-dashed bg-warning/5">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, index) => (
              <tr key={t.id}>
                <th>{index + 1}</th>
                <td>{t.text}</td>
                <td className="font-semibold flex items-center gap-2">
                  {t.amount > 0 ? (
                    <TrendingUp className="text-success w-6 h-6" />
                  ) : (
                    <TrendingDown className="text-error w-6 h-6" />
                  )}

                  {t.amount > 0 ? `+ ${t.amount}` : `${t.amount}`}
                </td>
                <td>{formatDate(t.created_at)}</td>
                <td className="flex gap-2">
                  <button
                    onClick={() => openEditModal(t)}
                    className="btn btn-sm btn-info btn-soft"
                    title="Edit transaction"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="btn btn-sm btn-error btn-soft"
                    title="Delete transaction"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog id="my_modal_3" className="modal backdrop-blur">
        <div className="modal-box border-2 border-warning/10 border-dashed">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Add transaction</h3>
          <div className="flex flex-col gapp-4 mt-4">
            <div className="flex flex-col gap-2">
              <label className="label">Texte</label>
              <input
                type="text"
                name="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Fill the following field ..."
                className="input w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="label">Amount</label>
              <input
                type="number"
                name="amount"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="Fill the following field ..."
                className="input w-full"
              />
            </div>
            <button
              className="w-full btn btn-warning mt-3"
              onClick={addTransaction}
              disabled={loading}
            >
              <PlusCircle className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </dialog>

      <dialog id="edit_modal" className="modal backdrop-blur">
        <div className="modal-box border-2 border-info/10 border-dashed">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Edit transaction</h3>
          {editingTransaction && (
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <label className="label">Text</label>
                <input
                  type="text"
                  value={editingTransaction.text}
                  onChange={(e) =>
                    setEditingTransaction({
                      ...editingTransaction,
                      text: e.target.value
                    })
                  }
                  className="input w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="label">Amount</label>
                <input
                  type="number"
                  value={editingTransaction.amount}
                  onChange={(e) =>
                    setEditingTransaction({
                      ...editingTransaction,
                      amount: Number(e.target.value)
                    })
                  }
                  className="input w-full"
                />
              </div>

              <button
                className="w-full btn btn-info mt-3"
                onClick={updateTransaction}
                disabled={loading}
              >
                <Pencil className="w-4 h-4" />
                Update
              </button>
            </div>
          )}
        </div>
      </dialog>
    </div>
  )
}
