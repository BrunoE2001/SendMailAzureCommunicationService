import dotenv from 'dotenv'; //! Necesario para leer el entorno
import { EmailClient } from "@azure/communication-email"; //! Libreria de azure communication-email
import path from 'path'; //Manejar rutas absolutas
import fs from 'fs'; //! Necesario para leer archivos en el sistema

// Cargar las variables de entorno
dotenv.config({ path: path.resolve('../.env') });

// Leer la cadena de conexión de Azure desde el archivo .env
const connectionString = process.env['COMMUNICATION_SERVICES_CONNECTION_STRING'];
const emailClient = new EmailClient(connectionString); //! Crear el cliente de email

const __dirname = path.resolve();
const filePaths = [
    path.resolve(__dirname, '../assets/docs', 'data.pdf'),
    path.resolve(__dirname, '../assets/img', 'ASEG5-eMail Sender - Level 1.jpg'),
];

// Función para verificar la existencia de archivos
function verifyFilesExist() {
    filePaths.forEach(filePath => {
        if (!fs.existsSync(filePath)) {
            console.error(`Error: El archivo no existe en la ruta: ${filePath}`);
            process.exit(1); // Salir si el archivo no existe
        }
    });
}

// Función para leer y convertir archivos a base64
function getAttachments() {
    return filePaths.map(filePath => {
        const fileExtension = path.extname(filePath).toLowerCase();
        let contentType = '';
        if (fileExtension === '.pdf') contentType = 'application/pdf';
        else if (fileExtension === '.jpg' || fileExtension === '.jpeg') contentType = 'image/jpeg';
        else if (fileExtension === '.png') contentType = 'image/png';
        else {
            console.error(`Tipo de archivo no soportado: ${fileExtension}`);
            process.exit(1);
        }

        const contentBytes = fs.readFileSync(filePath, 'base64');
        return {
            contentType: contentType,
            name: path.basename(filePath),
            contentInBase64: contentBytes
        };
    });
}

// Simulación de la base de datos con datos estáticos
const simulatedDatabase = {
    '123': {
        subject: "Correo de prueba #123",
        text: "Este es un correo de prueba simulado.",
        htmlContent: "<html><body><h1>Este es un correo de prueba simulado.</h1></body></html>",
        recipientEmail: "capinemo940@gmail.com",
        recipientName: "Destinatario Simulado"
    },
    '124': {
        subject: "Correo de prueba #124",
        text: "Otro correo de prueba simulado.",
        htmlContent: "<html><body><h1>Otro correo de prueba simulado.</h1></body></html>",
        recipientEmail: "brunogarciaerick@gmail.com",
        recipientName: "Destinatario Simulado 2"
    }
};

// Función F_temp1 para obtener datos simulados y construir el correo
async function F_temp1(emailNumber) {
    // Simulamos la consulta a la base de datos usando el objeto simulado
    const row = simulatedDatabase[emailNumber];

    if (!row) {
        console.error(`No se encontraron datos para el correo número ${emailNumber}`);
        return;
    }

    const emailMessage = {
        senderAddress: "DoNotReply@d5e77ea5-3e73-4178-b377-220363c4695e.azurecomm.net",
        content: {
            subject: row.subject,
            plainText: row.text, // Asumiendo que la simulación tiene un campo 'text' para el contenido del correo
            html: row.htmlContent, // Asumiendo 'htmlContent'
        },
        recipients: {
            to: [{ address: row.recipientEmail, displayName: row.recipientName }],
            cc: [],
            bcc: []
        },
        attachments: getAttachments()
    };

    // Enviar el correo con el contenido obtenido de la simulación
    await sendEmail(emailMessage);
}

// Función para enviar el correo
async function sendEmail(emailMessage) {
    try {
        const poller = await emailClient.beginSend(emailMessage);
        const response = await poller.pollUntilDone();
        console.log("Correo enviado con éxito. ID:", response.id);
    } catch (error) {
        console.error("Error al enviar el correo:\n", error);
    }
}

// Verificar los archivos
verifyFilesExist();

// Obtener el número de correo desde la línea de comandos
const emailNumber = process.argv[2]; // El número de correo es el primer argumento

if (!emailNumber) {
    console.error("Se debe proporcionar el número de correo como parámetro.");
    process.exit(1);
}

// Llamar a F_temp1 con el número de correo
F_temp1(emailNumber);
