import { WelcomeScreen } from "../WelcomeScreen";

export default function WelcomeScreenExample() {
  const handleContinue = (operatorName: string, date: string) => {
    console.log('Continue clicked', { operatorName, date });
  };

  return <WelcomeScreen onContinue={handleContinue} />;
}