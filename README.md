<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bobó de Camarão - Pedido</title>
    <style>
        /* Estilos CSS para a aparência do site */
        body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .container {
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
        }

        h1 {
            color: #333;
            margin-bottom: 20px;
        }

        .product-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin-bottom: 20px;
        }

        .price {
            font-size: 28px;
            color: #28a745;
            margin-bottom: 20px;
            font-weight: bold;
        }

        .quantity-selector {
            margin-bottom: 20px;
        }

        .quantity-selector label {
            font-size: 18px;
            margin-right: 10px;
        }

        .quantity-selector input {
            width: 60px;
            padding: 8px;
            font-size: 16px;
            text-align: center;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        
        .info-retirada {
            margin-bottom: 25px;
            font-size: 18px;
            text-align: center;
        }

        .buy-button {
            background-color: #25D366;
            color: white;
            padding: 15px 25px;
            text-decoration: none;
            font-size: 18px;
            border-radius: 8px;
            font-weight: bold;
            transition: background-color 0.3s;
            cursor: pointer;
            border: none;
            display: inline-block;
        }

        .buy-button:hover {
            background-color: #128C7E;
        }

        footer {
            margin-top: 20px;
            font-size: 14px;
            color: #888;
        }

    </style>
</head>
<body>

    <div class="container">
        <h1>Bobó de camarão</h1>
        <img src="camarão.png" alt="camarão" width="100" height="100" class="product-image">
        <p class="price">R$ 30</p>

        <div class="quantity-selector">
            <label for="quantidade">Quantidade:</label>
            <input type="number" id="quantidade" value="1" min="1">
        </div>

        <div class="info-retirada">
            <p><strong>Forma de Entrega:</strong> Apenas retirada no local.</p>
        </div>


        <button class="buy-button" onclick="enviarPedido()">Comprar Agora</button>

        <footer>
            <p>Clique em "Comprar Agora" para fazer seu pedido pelo WhatsApp.</p>
            <p>Local para retirada: 
                <a href="https://maps.app.goo.gl/GxwovGaZVTpDw1XW6?g_st=ac" target="_blank" style="color: #1a73e8; font-weight: bold;">
                    Braseiro Carnes e Frios!!
                </a>
            </p>
        </footer>
    </div>

    <script>
        // Função JavaScript para enviar o pedido
        function enviarPedido() {
            // *CERTIFIQUE-SE DE INCLUIR O CÓDIGO DO PAÍS (55 para Brasil) E O DDD!*
            const numeroWhatsApp = "556392240626"; // Número no formato internacional (país + DDD + número)
            const precoUnitario = 30.00; // Preço fixo do produto

            const quantidade = parseInt(document.getElementById("quantidade").value, 10);
            
            if (isNaN(quantidade) || quantidade < 1) {
                alert("Por favor, insira uma quantidade válida (mínimo 1).");
                return;
            }

            const valorTotal = precoUnitario * quantidade;
            const detalhesEntrega = `\n*Forma de Entrega:* Retirada no local`;

            // Mensagem que será enviada
            const mensagem = `Olá! Gostaria de fazer um novo pedido:\n\n*Produto:* Bobó de camarão\n*Quantidade:* ${quantidade}\n*Valor Total:* R$ ${valorTotal.toFixed(2).replace('.', ',')}${detalhesEntrega}`;
            
            // Cria o link para o WhatsApp
            const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

            // Redireciona para o WhatsApp
            window.open(linkWhatsApp, '_blank');
        }
    </script>

</body>
</html>
