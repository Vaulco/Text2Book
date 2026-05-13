import {
  CommandTarget,
  GenerationFormat,
  IFormData,
  IResults,
  JavaVersion,
  MinecraftVersion,
} from '../global/types.ts';
import useLocalStorage from 'use-local-storage';

export default function useForm(showResults: IResults): IFormData {
  const [text, setText] = useLocalStorage('text', '');
  const [author, setAuthor] = useLocalStorage('author', '');
  const [title, setTitle] = useLocalStorage('title', '');
  const [nameSuffix, setNameSuffix] = useLocalStorage('nameSuffix', '');
  const [generationFormat, setGenerationFormat] = useLocalStorage<GenerationFormat>(
    'generationFormat',
    'commands'
  );
  const [linesPerPage, setLinesPerPage] = useLocalStorage('linesPerPage', 14);
  const [minecraftVersion, setMinecraftVersion] = useLocalStorage<MinecraftVersion>(
    'minecraftVersion',
    'java'
  );
  const [javaVersion, setJavaVersion] = useLocalStorage<JavaVersion>(
    'javaVersion',
    '1.20.5+'
  );
  const [commandTarget, setCommandTarget] = useLocalStorage<CommandTarget>(
    'commandTarget',
    'commandblock'
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    showResults(
      text,
      title,
      author,
      minecraftVersion,
      generationFormat,
      javaVersion,
      linesPerPage,
      nameSuffix,
      commandTarget
    );
  };

  return {
    generationFormat,
    setGenerationFormat,
    minecraftVersion,
    setMinecraftVersion,
    text,
    setText,
    linesPerPage,
    setLinesPerPage,
    nameSuffix,
    setNameSuffix,
    author,
    setAuthor,
    title,
    setTitle,
    javaVersion,
    setJavaVersion,
    commandTarget,
    setCommandTarget,
    handleSubmit,
  };
}