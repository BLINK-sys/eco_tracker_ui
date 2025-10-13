import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://eco-tracker-server.onrender.com';

class SocketService {
  private socket: Socket | null = null;
  private companyId: string | null = null;
  private listeners: Map<string, Function[]> = new Map();

  // Подключение к серверу
  connect(companyId?: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Connecting to WebSocket server:', SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],  // WebSocket первым для Render Starter
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000,
      upgrade: true,
      rememberUpgrade: true,
    });

    // Отладка - слушаем ВСЕ события (ДОЛЖНО БЫТЬ ПЕРВЫМ!)
    this.socket.onAny((eventName, ...args) => {
      console.log(`[SOCKET RAW] Event: "${eventName}"`, args);
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      console.log('   Transport:', this.socket?.io.engine.transport.name);
      
      // Присоединяемся к комнате компании с небольшой задержкой
      if (companyId) {
        setTimeout(() => {
          this.joinCompany(companyId);
        }, 100);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    this.socket.on('connection_response', (data) => {
      console.log('📡 Server response:', data);
    });

    this.socket.on('joined_company', (data) => {
      console.log('✅ Joined company room:', data.company_id);
    });

    // Обработчики событий обновлений
    this.socket.on('container_updated', (data) => {
      console.log('📦 [SOCKET] Container updated event received!');
      console.log('   Data:', data);
      this.emit('container_updated', data);
    });

    this.socket.on('location_updated', (data) => {
      console.log('📍 [SOCKET] Location updated event received!');
      console.log('   Data:', data);
      this.emit('location_updated', data);
    });
  }

  // Присоединиться к комнате компании
  joinCompany(companyId: string) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.companyId = companyId;
    console.log('🏢 Joining company room:', companyId);
    this.socket.emit('join_company', { company_id: companyId });
  }

  // Покинуть комнату компании
  leaveCompany() {
    if (this.socket?.connected && this.companyId) {
      this.socket.emit('leave_company', { company_id: this.companyId });
      console.log('🏢 Left company room:', this.companyId);
      this.companyId = null;
    }
  }

  // Отключиться от сервера
  disconnect() {
    if (this.socket) {
      this.leaveCompany();
      this.socket.disconnect();
      this.socket = null;
      console.log('WebSocket disconnected');
    }
  }

  // Подписка на события
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Отписка от событий
  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Вызов всех подписчиков события
  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Проверка подключения
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();

