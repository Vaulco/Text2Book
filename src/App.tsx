import Layout from './Layout.tsx';
import useApp from './hooks/useApp.ts';
import Form from './views/form/Form.tsx';
import Output from './views/tabs/Output.tsx';

function App() {
  const {
    results,
    loading,
    fadeinProps,
    timeToGenerate,
    setFadeIn,
    showResults,
  } = useApp();

  return (
    <Layout>
      <Form
        showResults={showResults}
        loading={loading}
      />
      <Output
        results={results}
        fadeinProps={fadeinProps}
        timeToGenerate={timeToGenerate}
        setFadeIn={setFadeIn}
      />
    </Layout>
  );
}

export default App;