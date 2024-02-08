import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
  onCreateNote: (content: string) => void;
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let speechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onCreateNote }: NewNoteCardProps) {
  const [shouldShowWelcomeText, setShouldShowWelcomeText] = useState(true);
  const [textAreaContent, setTextAreaContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  function handleTextNote() {
    setShouldShowWelcomeText(false);
  }

  function handleTextAreaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setTextAreaContent(event.target.value);

    if (event.target.value === "") {
      setShouldShowWelcomeText(true);
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault();
    if (textAreaContent === "") {
      toast.info("A nota está vazia.");
      return;
    }
    onCreateNote(textAreaContent);
    setTextAreaContent("");
    setShouldShowWelcomeText(true);
    toast.success("Nota criada com sucesso.");
  }

  function handleStartRecording() {
    setIsRecording(true);
    setShouldShowWelcomeText(false);

    const isSpeechRecognitionAPIAvailable = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
    if (!isSpeechRecognitionAPIAvailable) {
      toast.info(
        "Infelizmente o seu navegador não suporta a API de gravação e reconhecimento de áudio. Você pode testar no Google Chrome, Safari ou Edge"
      );
      return;
    }

    speechRecognition = new SpeechRecognitionAPI();
    speechRecognition.lang = "pt-BR";
    // to manually stop recording instead of on silence
    speechRecognition.continuous = true;
    // não trazer alternativas a palavras dúbias, trazer o primeiro resultado do reconhecimento
    speechRecognition.maxAlternatives = 1;
    // streaming de texto de reconhecimento de fala em tempo real
    speechRecognition.interimResults = true;
    // o que fazer toda vez que a API receber alguma informação de fala
    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");
      setTextAreaContent(transcription);
    };
    // o que fazer em caso de erro
    speechRecognition.onerror = (event) => {
      console.error(event);
    };
    // iniciar reconhecimento
    speechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecording(false);
    if (speechRecognition !== null) {
      speechRecognition?.stop();
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="flex flex-col rounded-md bg-slate-700 p-5 gap-3 text-left overflow-hidden hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none">
        <span className="text-sm font-medium text-slate-200">Adicionar nota</span>
        <p className="text-sm leading-6 text-slate-400">
          Grave uma nota em áudio que será convertida para texto automagicamente
        </p>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50">
          <Dialog.Content className="fixed flex flex-col left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 outline-none bg-slate-700 rounded-md w-full h-[60vh] max-w-2xl overflow-hidden">
            <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
              <X className="size-5 " />
            </Dialog.Close>
            <form className="flex flex-col flex-1 ">
              <div className="flex flex-col flex-1 gap-3 p-5">
                <span className="text-sm font-medium text-slate-300">Adicionar nota</span>
                {shouldShowWelcomeText ? (
                  <p className="text-sm leading-6 text-slate-400">
                    Comece{" "}
                    <button
                      type="button"
                      className="font-medium text-lime-400 hover:underline"
                      onClick={handleStartRecording}
                    >
                      gravando uma nota em áudio
                    </button>{" "}
                    ou se preferir{" "}
                    <button className="font-medium text-lime-400 hover:underline" onClick={handleTextNote}>
                      utilize apenas texto.
                    </button>
                  </p>
                ) : (
                  <textarea
                    autoFocus
                    className="flex-1 text-sm leading-6 text-slate-400 bg-transparent resize-none outline-none"
                    value={textAreaContent}
                    onChange={handleTextAreaChange}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={isRecording ? handleStopRecording : handleSaveNote}
                className={`flex justify-center items-center gap-2 w-full py-4 text-center text-sm outline-none font-medium ${
                  isRecording ? "bg-slate-400 text-slate-300" : "bg-lime-400 text-lime-950 hover:bg-lime-500"
                }`}
              >
                {isRecording ? (
                  <>
                    <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                    Gravando... (clique para parar)
                  </>
                ) : (
                  "Salvar nota"
                )}
              </button>
            </form>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
