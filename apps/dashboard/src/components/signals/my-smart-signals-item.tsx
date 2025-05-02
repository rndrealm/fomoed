type MySmartSignalItemProps = {
  title: string;
  description: string;
  createdAt: string;
  onDelete?: () => void;
  firedAt: string | null;
};

const MySmartSignalItem = (props: MySmartSignalItemProps) => {
  return <div>MySmartSignalItem</div>;
};

export default MySmartSignalItem;
