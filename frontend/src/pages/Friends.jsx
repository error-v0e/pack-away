import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input, Button } from "@nextui-org/react";  // Import NextUI komponent

const Friends = () => {
  const [number, setNumber] = useState(0);
  const [inputText, setInputText] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    const fetchNumber = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/number");
        setNumber(response.data.number);
      } catch (error) {
        console.error("Chyba při načítání čísla:", error);
      }
    };
    fetchNumber();
  }, []);

  // Použití async/await pro axios.post
  const handleSend = async () => {
    try {
        const response = await axios.post("http://localhost:5000/api/send-text", { text: inputText, number: number });
      setResponse(response.data.message);
    } catch (error) {
      console.error("Chyba při odesílání textu:", error);
    }
  };

  return (
    <div>
      <h1>Přátelé</h1>
      <p>Načtené číslo z backendu: {number}</p>

      <Input
        clearable
        underlined
        placeholder="Zadej text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <Button color="primary" onPress={handleSend}>
        Odeslat
      </Button>

      {response && <p>Odpověď ze serveru: {response}</p>}
    </div>
  );
};

export default Friends;
