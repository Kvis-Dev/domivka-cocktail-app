import { useEffect, useState } from 'react'
import './App.css'
import { saveOrder, getAllOrders, clearOrders } from './db'
import mijitoImg from './assets/mijito.png'
import mijitoNaImg from './assets/mojito-na.png'
import whCola from './assets/wh-cola.png'
import citrussaur from './assets/citrussaur.png'
import aperol from './assets/aperol.png'
import song from './assets/ifyoulikepinacolada.png'
import redbbl from './assets/redbbl.png'
import tsunr from './assets/tqsunrise.png'
import reactImg from './assets/react.svg'
import gintk from './assets/gintonik.png'
import groni from './assets/groni.png'
import cmax from './assets/cmax.png'
import wtr from './assets/wtr.png'

// Placeholder list — to be replaced with the real cocktails & prices provided later.
const COCKTAILS = [
  { id: 1, name: 'Mojito non-alk', price: 150, color: '#A8E6CF', image: mijitoNaImg },
  { id: 2, name: 'Whiskey Cola', price: 200, color: '#D4A373', image: whCola },
  { id: 3, name: 'Citrus Sour', price: 200, color: '#FFE066', image: citrussaur },
  { id: 4, name: 'Aperol', price: 200, color: '#FFB085', image: aperol },
  { id: 5, name: 'Gin Tonic', price: 200, color: '#B5EAD7', image: gintk },
  { id: 6, name: 'Mojito', price: 250, color: '#7BD389', image: mijitoImg },
  { id: 7, name: 'Red Bubble', price: 250, color: '#FF8FA3', image: redbbl },
  { id: 8, name: 'Tequila Sunrise', price: 250, color: '#FFB347', image: tsunr },
  { id: 9, name: 'Piña Colada', price: 250, color: '#FFF3B0', image: song },
  { id: 10, name: 'Negroni', price: 300, color: '#F8B195', image: groni },
  { id: 11, name: 'Crazy Maks', price: 350, color: '#C77DFF', image: cmax },
  { id: 12, name: 'Water', price: 50, color: '#a6bbff', image: wtr },
]

function App() {
  // counts: { [cocktailId]: number }
  const [counts, setCounts] = useState({})
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState([])

  const addCocktail = (c) => {
    setCounts((prev) => ({ ...prev, [c.id]: (prev[c.id] || 0) + 1 }))
  }

  const removeCocktail = (c) => {
    setCounts((prev) => {
      const current = prev[c.id] || 0
      if (current <= 1) {
        const { [c.id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [c.id]: current - 1 }
    })
  }

  const total = COCKTAILS.reduce(
    (sum, c) => sum + c.price * (counts[c.id] || 0),
    0,
  )
  const itemsCount = Object.values(counts).reduce((s, n) => s + n, 0)

  const newOrder = async () => {
    if (itemsCount === 0) return
    const items = COCKTAILS
      .filter((c) => counts[c.id])
      .map((c) => ({ id: c.id, name: c.name, price: c.price, qty: counts[c.id] }))
    try {
      await saveOrder({
        createdAt: Date.now(),
        total,
        itemsCount,
        items,
      })
    } catch (e) {
      console.error('Failed to save order', e)
    }
    setCounts({})
  }

  const cancelOrder = () => {
    setCounts({})
  }

  const openHistory = async () => {
    try {
      const rows = await getAllOrders()
      setHistory(rows)
    } catch (e) {
      console.error('Failed to load history', e)
      setHistory([])
    }
    setHistoryOpen(true)
  }

  const closeHistory = () => setHistoryOpen(false)

  const clearHistory = async () => {
    if (!confirm('Clear all order history?')) return
    await clearOrders()
    setHistory([])
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setHistoryOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1>🍹</h1>
          <span className="count">Items: {itemsCount}</span>
          <span className="total">Total: {total}</span>

        <div className="order-info">
          <button
            className="icon-btn"
            onClick={openHistory}
            aria-label="Order history"
            title="Order history"
          >
            🕘
          </button>
          <button
            className="cancel-order-btn"
            onClick={cancelOrder}
            disabled={itemsCount === 0}
          >
            Cancel Order
          </button>
          <button
            className="new-order-btn"
            onClick={newOrder}
            disabled={itemsCount === 0}
          >
            New Order
          </button>
        </div>
      </header>

      <main className="grid">
        {COCKTAILS.map((c) => {
          const qty = counts[c.id] || 0
          return (
            <div
              key={c.id}
              className="card"
              style={{
                backgroundColor: c.color,
                backgroundImage: `url(${c.image})`,
                backgroundSize: '80%',
                backgroundPosition: 'center center',
                backgroundRepeat:'no-repeat'
              }}
              onClick={() => addCocktail(c)}
              role="button"
            >
              <div className="card-top" style={{

              }}>
                <span className="card-name">{c.name}</span>
                {qty > 0 && <span className="card-qty">×{qty}</span>}
              </div>
              <div className="card-bottom">
                <button
                  className="minus-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeCocktail(c)
                  }}
                  disabled={qty === 0}
                  aria-label={`Remove one ${c.name}`}
                >
                  −
                </button>
                <span className="card-price">{c.price}</span>
              </div>
            </div>
          )
        })}
      </main>

      {historyOpen && (
        <div className="modal-backdrop" onClick={closeHistory}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🕘 Order History</h2>
              <button className="modal-close" onClick={closeHistory} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              {history.length === 0 ? (
                <p className="empty">No orders yet.</p>
              ) : (
                <ul className="history-list">
                  {history.map((o) => (
                    <li key={o.id} className="history-item">
                      <div className="history-row">
                        <span className="history-date">
                          {new Date(o.createdAt).toLocaleString()}
                        </span>
                        <span className="history-total">₴{o.total.toFixed(2)}</span>
                      </div>
                      <div className="history-items">
                        {o.items.map((it) => (
                          <span key={it.id} className="history-chip">
                            {it.name} ×{it.qty}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="modal-footer">
              <span className="history-summary">
                {history.length} order{history.length === 1 ? '' : 's'} · Total ₴
                {history.reduce((s, o) => s + o.total, 0).toFixed(2)}
              </span>
              <button
                className="cancel-order-btn"
                onClick={clearHistory}
                disabled={history.length === 0}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
