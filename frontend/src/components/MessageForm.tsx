import { Button, Input, Space, Typography } from "antd";
import { useState } from "react";

type Props = {
    mode: "edit" | "analyze";
};

const MessageForm = ({ mode }: Props) => {
    const [text, setText] = useState("");
    const [output, setOutput] = useState("");
    const [listening, setListening] = useState(false);

    const startListening = () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
            setText(event.results[0][0].transcript);
            setListening(false);
        };

        recognition.onerror = () => {
            setListening(false);
        };

        recognition.onend = () => setListening(false);

        recognition.start();
        setListening(true);
    };

    const analyze = async () => {
        const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, mode }),
        });

        const data = await res.json();
        setOutput(data.result || "No result");
    };

    return (
        <Space direction="vertical" style={{ width: "100%" }}>
            <Input.TextArea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message or use voice"
            />
            <Space>
                <Button onClick={startListening} loading={listening}>
                    {listening ? "Listening..." : "Voice Input"}
                </Button>
                <Button type="primary" onClick={analyze}>
                    Analyze
                </Button>
            </Space>
            {output && (
                <Typography.Paragraph style={{ marginTop: "1rem" }}>
                    <strong>Result:</strong> {output}
                </Typography.Paragraph>
            )}
        </Space>
    );
};

export default MessageForm;
