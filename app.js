// app.js
const supabaseUrl = 'https://wxwtlhjmlovekkqkxqni.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4d3RsaGptbG92ZWtrcWt4cW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NjI3MjEsImV4cCI6MjA2MDAzODcyMX0.FBirse5ZoazkE1IKa7qpSvim7OsbxKZNMCmphHfZIJA';
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

// Перехватываем отправку заказа
document.getElementById('confirmBtn').addEventListener('click', async () => {
    try {
        // Собираем данные
        let orderSummary = selectedSubservices.length > 0 ? selectedSubservices.join(', ') : '';
        if (customInput.value.trim()) orderSummary += (orderSummary ? '; ' : '') + customInput.value.trim();
        const address = document.getElementById('addressInput').value.trim();
        const city = document.getElementById('cityInput').value.trim();
        if (!orderSummary) {
            alert('Выберите хотя бы одну услугу или опишите задачу вручную!');
            return;
        }
        if (!address || !city) {
            alert('Пожалуйста, укажите адрес и город!');
            return;
        }

        const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || `guest_${Date.now()}`;
        const orderData = {
            category: currentCategory,
            subservices: selectedSubservices,
            custom: customInput.value.trim(),
            address: address,
            city: city,
            user_id: userId
        };

        // Отправка в Supabase
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                user_id: userId,
                category: orderData.category,
                form: orderData,
                address: orderData.address,
                city: orderData.city,
                description: orderSummary,
                status: 'searching',
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;

        // Отправка в Telegram-бот
        if (window.Telegram && window.Telegram.WebApp) {
            window.Telegram.WebApp.sendData(JSON.stringify({
                service: orderData.category,
                subservices: orderData.subservices,
                comment: orderData.custom,
                address: orderData.address,
                city: orderData.city,
                user_id: orderData.user_id,
                order_id: data[0].id
            }));
        }

        // Показываем попап "Спасибо"
        document.getElementById('confirmationPopup').classList.add('hidden');
        document.getElementById('thankYouPopup').classList.remove('hidden');
        happyClientsCount++;
        updateHappyClients();
        setTimeout(() => {
            document.getElementById('thankYouPopup').classList.add('hidden');
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.close();
            }
        }, 2000);

    } catch (error) {
        console.error('Error:', error);
        alert('❌ Ошибка при отправке заявки: ' + error.message);
    }
});