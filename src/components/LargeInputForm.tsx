import React, { useState, ChangeEvent, FormEvent } from "react";
import { Form, Button, Container, Image } from "react-bootstrap";

const QrCodeGenerator: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputText(e.target.value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (inputText.trim()) {
      const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        inputText
      )}`;
      setQrCodeUrl(qrCodeApiUrl);
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="mb-4">QR Code Generator</h1>
      <Form onSubmit={handleSubmit} className="w-50">
        <Form.Group controlId="formBasicText">
          <Form.Control
            type="text"
            placeholder="Url veya metin giriniz."
            value={inputText}
            onChange={handleInputChange}
            style={{ fontSize: "24px", padding: "20px", width: "100%" }}
          />
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          style={{ fontSize: "24px", padding: "10px 40px", marginTop: "20px" }}
        >
          Gönder
        </Button>
      </Form>
      {qrCodeUrl && (
        <div className="mt-4">
          <Image src={qrCodeUrl} alt="Generated QR Code" fluid />
        </div>
      )}
    </Container>
  );
};

export default QrCodeGenerator;
