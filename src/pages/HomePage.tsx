import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, BarChart3, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Система мониторинга отходов
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            EcoTracker
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
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
          <Card>
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

          <Card>
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

          <Card>
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

          <Card>
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
          <Card className="max-w-2xl mx-auto">
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