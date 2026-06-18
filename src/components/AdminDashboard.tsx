import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatPrice } from '../data';
import { Package, MessageSquare, BarChart3, Users, Clock, Search, CheckCircle2 } from 'lucide-react';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'chat'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    // Listen to orders
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
    });

    // Listen to chats
    const qChats = query(collection(db, 'chats'), orderBy('updatedAt', 'desc'));
    const unsubChats = onSnapshot(qChats, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(chatsData);
    });

    return () => {
      unsubOrders();
      unsubChats();
    };
  }, []);

  const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const markOrderAsPaid = async (orderId: string) => {
    await updateDoc(doc(db, 'orders', orderId), { status: 'paid' });
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !activeChatId) return;
    const chatDoc = chats.find(c => c.id === activeChatId);
    if (!chatDoc) return;

    const newMessages = [...(chatDoc.messages || []), { sender: 'admin', text: replyMessage, time: new Date().toISOString() }];
    await updateDoc(doc(db, 'chats', activeChatId), {
      messages: newMessages,
      updatedAt: new Date().toISOString()
    });
    setReplyMessage('');
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="min-h-screen bg-neutral-100 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-200">
          <h1 className="font-mono font-bold text-xl tracking-tight">NUVA HQ</h1>
          <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest font-mono">Live Control</p>
        </div>
        <div className="p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-all focus:outline-none ${activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-neutral-50 text-neutral-600'}`}
          >
            <Package className="h-4 w-4" />
            Vendas & Encomendas
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm transition-all focus:outline-none ${activeTab === 'chat' ? 'bg-black text-white' : 'hover:bg-neutral-50 text-neutral-600'}`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4" />
              Live Chat
            </div>
            {chats.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-mono">{chats.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <Search className="h-4 w-4" />
            <input type="text" placeholder="Procurar encomendas, clientes..." className="outline-none w-64 bg-transparent" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-green-100 text-green-700 font-mono px-2 py-1 rounded">SISTEMA ONLINE</span>
            <div className="h-8 w-8 bg-neutral-200 rounded-full"></div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'orders' && (
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 border border-neutral-200 rounded-lg shadow-sm">
                  <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Receita Total</p>
                  <p className="text-3xl font-light mt-2">{formatPrice(totalRevenue)}</p>
                </div>
                <div className="bg-white p-6 border border-neutral-200 rounded-lg shadow-sm">
                  <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Encomendas</p>
                  <p className="text-3xl font-light mt-2">{orders.length}</p>
                </div>
                <div className="bg-white p-6 border border-neutral-200 rounded-lg shadow-sm">
                  <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono">Aguardando Pagamento</p>
                  <p className="text-3xl font-light mt-2 text-amber-500">{pendingOrders}</p>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-5 border-b border-neutral-200">
                  <h3 className="font-semibold">Últimas Encomendas</h3>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-neutral-500 font-mono text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-medium">Ref Encomenda</th>
                      <th className="px-6 py-4 font-medium">Cliente</th>
                      <th className="px-6 py-4 font-medium">Data</th>
                      <th className="px-6 py-4 font-medium">Total</th>
                      <th className="px-6 py-4 font-medium">Estado</th>
                      <th className="px-6 py-4 font-medium text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium">{order.customerInfo?.firstName} {order.customerInfo?.lastName}</p>
                          <p className="text-xs text-neutral-500">{order.customerInfo?.email}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-neutral-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                        </td>
                        <td className="px-6 py-4">
                          {formatPrice(order.total || 0)}
                          <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{order.customerInfo?.paymentMethod}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-mono rounded ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.status === 'paid' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {order.status === 'pending' && (
                            <button onClick={() => markOrderAsPaid(order.id)} className="text-xs text-blue-600 hover:underline">Confirmar Pagamento</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-neutral-500 font-mono text-xs uppercase tracking-widest">
                          Nenhuma encomenda registada ainda
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="h-[calc(100vh-10rem)] max-w-6xl mx-auto flex bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
              {/* Chat List */}
              <div className="w-1/3 border-r border-neutral-200 flex flex-col">
                <div className="p-4 border-b border-neutral-200 bg-neutral-50 font-semibold text-sm">
                  Conversas Ativas
                </div>
                <div className="flex-1 overflow-auto">
                  {chats.map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={`w-full text-left p-4 border-b border-neutral-100 transition-colors focus:outline-none ${activeChatId === chat.id ? 'bg-blue-50' : 'hover:bg-neutral-50'}`}
                    >
                      <p className="font-semibold text-sm">{chat.userName || 'Visitante'}</p>
                      <p className="text-xs text-neutral-500 truncate mt-1">
                        {chat.messages?.[chat.messages.length - 1]?.text || 'Nova conversa'}
                      </p>
                    </button>
                  ))}
                  {chats.length === 0 && (
                    <div className="p-8 text-center text-neutral-400 text-xs">
                      Não existem chats ativos.
                    </div>
                  )}
                </div>
              </div>
              
              {/* Chat View */}
              <div className="flex-1 flex flex-col bg-neutral-50">
                {activeChat ? (
                  <>
                    <div className="p-4 border-b border-neutral-200 bg-white font-semibold text-sm">
                      Chat com {activeChat.userName || 'Visitante'}
                    </div>
                    <div className="flex-1 overflow-auto p-6 space-y-4">
                      {activeChat.messages?.map((msg: any, idx: number) => (
                        <div key={idx} className={`max-w-[80%] ${msg.sender === 'admin' ? 'ml-auto' : 'mr-auto'}`}>
                          <div className={`p-3 rounded-lg text-sm ${msg.sender === 'admin' ? 'bg-black text-white rounded-br-none' : 'bg-white border border-neutral-200 rounded-bl-none shadow-sm'}`}>
                            {msg.text}
                          </div>
                          <p className={`text-[10px] text-neutral-400 mt-1 font-mono ${msg.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                            {new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-white border-t border-neutral-200 flex gap-3">
                      <input 
                        type="text" 
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                        placeholder="Escreva a resposta..." 
                        className="flex-1 bg-neutral-100 px-4 py-2.5 rounded-full text-sm outline-none focus:ring-2 focus:ring-neutral-200 transition-all"
                      />
                      <button 
                        onClick={handleSendReply}
                        className="px-6 py-2.5 bg-black text-white rounded-full text-xs font-semibold uppercase tracking-wider"
                      >
                        Enviar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
                    <MessageSquare className="h-12 w-12 opacity-20 mb-4" />
                    <p className="text-sm">Selecione uma conversa para começar a ajudar.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
