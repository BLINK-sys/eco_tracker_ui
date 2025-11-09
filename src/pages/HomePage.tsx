import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, BarChart3, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/astana.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Затемнение для читаемости */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 backdrop-blur-sm bg-white/80">
            Система мониторинга отходов
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary drop-shadow-lg">
            EcoTracker
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 drop-shadow-md">
            Современная система мониторинга и управления сбором отходов. 
            Отслеживайте контейнеры, оптимизируйте маршруты и улучшайте экологию вашего города.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link to="/login">Войти в систему</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/register">Зарегистрироваться</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="backdrop-blur-sm bg-white/95">
            <CardHeader>
              <MapPin className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Мониторинг в реальном времени</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Отслеживайте состояние контейнеров и планируйте сбор отходов в режиме реального времени
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/95">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Аналитика и отчеты</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Получайте детальную аналитику по сбору отходов и оптимизируйте процессы
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/95">
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Безопасность данных</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Надежная защита информации и соответствие стандартам безопасности
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/95">
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Управление командой</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Координируйте работу операторов и водителей для эффективного сбора отходов
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto backdrop-blur-sm bg-white/95">
            <CardHeader>
              <CardTitle className="text-2xl">Готовы начать?</CardTitle>
              <CardDescription>
                Присоединяйтесь к системе мониторинга отходов и улучшите экологию вашего города
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full md:w-auto" asChild>
                <Link to="/register">Создать аккаунт</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;