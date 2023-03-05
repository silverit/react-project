import WrapperProvider from "@providers/WrapperProvider";
import HomeContainer from "@containers/HomeContainer";

export default function Home() {
  return (
    <WrapperProvider>
      <HomeContainer />
    </WrapperProvider>
  );
}
