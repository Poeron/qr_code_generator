# QR Code Generator

A modern, feature-rich QR code generator and scanner built with React, TypeScript, and Tailwind CSS.

![QR Code Generator Screenshot](![image](https://github.com/user-attachments/assets/6f9810f0-ee65-4bff-8ff6-770497d77c12)
)

## Features

- **QR Code Generation**: Generate QR codes from any text or URL
- **QR Code Scanning**: Scan QR codes using your device camera
- **Customization Options**:
  - Choose from different QR code sizes
  - Select error correction level for better readability
- **Download & Share**:
  - Download QR codes as PNG images
  - Share directly via social media, email, or copy the link
- **History Tracking**: Save recently generated QR codes for quick access
- **Dark Mode**: Toggle between light and dark themes
- **Mobile Responsive**: Works great on all device sizes

## Demo

[Live Demo](#) (Replace with your deployed project URL)

## Tech Stack

- **React**: Frontend UI library
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Styling and responsive design
- **Vite**: Fast build tool and development server
- **HTML5 QR Code**: Library for QR code scanning

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/qr_code_generator.git
   cd qr_code_generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Usage

### Generating QR Codes

1. Enter a URL or text in the input field
2. Customize the size and error correction level if needed
3. Click "Generate QR Code"
4. Download or share the generated QR code

### Scanning QR Codes

1. Click the camera icon in the input field
2. Allow camera access when prompted
3. Point your camera at a QR code
4. The content will be automatically detected and displayed

### Using History

- Previously generated QR codes appear in the history panel
- Click on any history item to quickly regenerate that QR code
- Use the "Clear All" button to empty your history

## Building for Production

To build the app for production:

```bash
npm run build
```

The build files will be located in the `dist` directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [QR Server API](https://goqr.me/api/) for QR code generation
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) for QR code scanning functionality
- All contributors and maintainers of the libraries used in this project
