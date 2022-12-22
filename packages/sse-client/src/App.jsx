import React, { useState, useEffect, useCallback } from 'react'
import './App.css'

/**
 * @param {string} msg
 * @param {string} user
 * @returns {Promise<Response>}
 */
function post(msg, user) {
  return fetch('http://localhost:3000/fact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      msg,
      user,
    }),
  })
}

function useEventSource() {
  /**  @type {[{ msg:string; user: string }[], React.Dispatch<React.SetStateAction<{ msg:string; user: string }[]>>]} */
  const [facts, setFacts] = useState([])

  const handlerMessage = useCallback(event => {
    const parsedData = JSON.parse(event.data)

    setFacts(facts => facts.concat(parsedData))
  }, [])

  useEffect(() => {
    const events = new EventSource('http://localhost:3000/events')

    events.onmessage = handlerMessage
  }, [])

  return { facts }
}

function App() {
  const { facts } = useEventSource()
  const [msg, setMsg] = useState('')
  const [user, setUser] = useState('')
  const [loading, setLoading] = useState(false)

  const handlerChangeMsg = useCallback(e => {
    setMsg(e.target.value)
  }, [])
  const handlerChangeUser = useCallback(e => {
    setUser(e.target.value)
  }, [])
  const handlerSubmit = useCallback(() => {
    if (loading) return

    setLoading(true)
    post(msg, user)
      .then(e => {
        return e.json()
      })
      .then(() => {
        setMsg('')
        setLoading(false)
      })
  }, [msg, user, loading])

  return (
    <>
      <div className="submit-box">
        <div className="submit-box-msg">
          <textarea placeholder="Msg" value={msg} onChange={handlerChangeMsg} />
        </div>

        <div className="submit-box-user">
          <textarea placeholder="User name" value={user} onChange={handlerChangeUser} />
          <button disabled={!msg || !user} onClick={handlerSubmit}>
            submit
          </button>
        </div>
      </div>

      <table className="stats-table">
        <thead>
          <tr>
            <th>Msg</th>
            <th>User</th>
          </tr>
        </thead>

        <tbody>
          {facts.map((fact, i) => (
            <tr key={i}>
              <td>{fact.msg}</td>
              <td>{fact.user}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default App
