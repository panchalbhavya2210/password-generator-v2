import YahooChart from "../../components/trading-view";

export default function EquityStock() {
  return (
    <>
      <YahooChart symbol="TCS" resolution="5" lookbackDays={7} />
    </>
  );
}
