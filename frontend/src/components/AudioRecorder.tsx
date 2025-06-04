import { type FC, useState, useEffect } from 'react';
import { Button } from 'antd';
import styled from 'styled-components';
import { useAppTheme } from '../hooks/useAppTheme';

const RecordButton = styled(Button)<{ $isRecording: boolean }>`
    &.ant-btn {
        background: ${props => props.$isRecording ? ({ theme }) => theme.colorError : undefined};
        border-color: ${props => props.$isRecording ? ({ theme }) => theme.colorError : undefined};
        
        &:hover {
            background: ${props => props.$isRecording ? ({ theme }) => theme.colorErrorHover : undefined};
            border-color: ${props => props.$isRecording ? ({ theme }) => theme.colorErrorHover : undefined};
        }
    }
`;

interface AudioRecorderProps {
    onTranscription: (text: string) => void;
}

const AudioRecorder: FC<AudioRecorderProps> = ({ onTranscription }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const theme = useAppTheme();

    useEffect(() => {
        return () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        };
    }, [mediaRecorder]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };

            recorder.onstop = async () => {
                new Blob(chunks, { type: 'audio/webm' });
                // Здесь мы могли бы отправить audioBlob на сервер
                // Для демонстрации просто симулируем транскрипцию
                setTimeout(() => {
                    onTranscription('This is a simulated transcription of the recorded audio.');
                    stream.getTracks().forEach(track => track.stop());
                }, 1000);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <RecordButton
            $isRecording={isRecording}
            onClick={toggleRecording}
            theme={theme}
        >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
        </RecordButton>
    );
};

export default AudioRecorder; 