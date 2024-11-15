import dotenv from 'dotenv'; //! Necesario para leer enviroment
import { EmailClient } from "@azure/communication-email"; //! Libreria de azure communication-email
import path from 'path'; //Manejar rutas absolutas
import fs from 'fs'; //! Necesario para leer archivos en el sistema

dotenv.config(); //* Cargar las variables de entorno

const connectionString = process.env['COMMUNICATION_SERVICES_CONNECTION_STRING']; //! Leer la cadena de conexión de Azure desde el archivo .env
const emailClient = new EmailClient(connectionString); //! Crear el cliente de email

const __dirname = path.resolve();
// Definir las rutas de los archivos adjuntos
const filePaths = [
    path.resolve(__dirname, 'assets/docs', 'data.pdf'),
    path.resolve(__dirname, 'assets/img', 'ASEG5-eMail Sender - Level 1.jpg'),
];

// Verificar que todos los archivos existen
filePaths.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        console.error(`Error: El archivo no existe en la ruta: ${filePath}`);
        process.exit(1); // Salir si el archivo no existe
    }
});

// Leer y convertir los archivos a base64
const attachments = filePaths.map(filePath => {
    const fileExtension = path.extname(filePath).toLowerCase();
    let contentType = '';

    if (fileExtension === '.pdf') {
        contentType = 'application/pdf';
    } else if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
        contentType = 'image/jpeg';
    } else if (fileExtension === '.png') {
        contentType = 'image/png';
    } else {
        console.error(`Tipo de archivo no soportado: ${fileExtension}`);
        process.exit(1);
    }

    const contentBytes = fs.readFileSync(filePath, 'base64');
    
    return {
        contentType: contentType,
        name: path.basename(filePath), // Nombre del archivo
        contentInBase64: contentBytes // El contenido en base64
    };
});

// Configurar el mensaje de correo electrónico
const emailMessage = {
    senderAddress: "DoNotReply@d5e77ea5-3e73-4178-b377-220363c4695e.azurecomm.net",
    content: {
        subject: "Correo electrónico de prueba",
        plainText: "Hola mundo por correo electrónico.",
        html: `
			<html>
				<body>
					<h1>Hola mundo por correo electrónico.</h1>
				</body>
			</html>`,
    },
    recipients: {
        to: [
            { address: "capinemo940@gmail.com", displayName: "Destinatario" },
            //{ address: "brunogarciaerick@gmail.com", displayName: "Destinatario" },
        ],
        cc: [],
        bcc: []
    },
    attachments: attachments
};

// Función para enviar el correo
async function sendEmail() {
    try {
        const poller = await emailClient.beginSend(emailMessage);
        const response = await poller.pollUntilDone();
        console.log("Correo enviado con éxito. ID:", response.id);
    } catch (error) {
        console.error("Error al enviar el correo:\n", error);
    }
}

sendEmail();
