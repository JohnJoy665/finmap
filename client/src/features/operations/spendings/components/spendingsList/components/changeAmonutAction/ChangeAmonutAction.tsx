import { Button } from "antd";
import { useModalStore } from "../../../../../../../shared/ui/modal";
import type { SpendingByGroupItem } from "../../../../../../../shared/types/spendings.types";
import { EditOutlined } from "@ant-design/icons";
import styles from "./ChangeAmonutAction.module.css";
import { changeSpendingAmount } from "../../../../api/changeSpendingAmount";

type changeAmonutActionProps = {
  spending: SpendingByGroupItem;
  handleChangeSpendingAmount: (
    spendingId: string,
    newAmountSpending: string,
    accountId: string,
    newAccountSpending: string
  ) => void;
};

function ChangeAmonutAction({
  handleChangeSpendingAmount,
  spending,
}: changeAmonutActionProps) {
  const openModal = useModalStore((store) => store.openModal);

  async function getChangeSpendingAmount(
    spendingId: string,
    spendingAmount: string,
    conversionFactor: number
  ) {
    try {
      const changedSpending = await changeSpendingAmount({
        spendingId,
        spendingAmount: String(Number(spendingAmount) * conversionFactor),
      });
      handleChangeSpendingAmount(
        changedSpending.data.spendingId,
        changedSpending.data.spendingAmount,
        changedSpending.data.accountId,
        changedSpending.data.accountAmount
      );
    } catch (error) {
      console.log(error);
    }
  }

  function handleChangeAmount() {
    openModal({
      type: "changeAmount",
      strategy: "destroy",
      props: {
        conversionFactor: spending.conversionFactor,
        currencySymbol: spending.currencySymbol,
        oldAmount: String(Number(spending.amount) / spending.conversionFactor),
        fieldLable: "Сумма покупки",
        title: "Изменить сумму покупки",
        itemId: spending.id,
        onChangeAmount: async (values) => {
          await getChangeSpendingAmount(
            values.itemId,
            values.newAmount,
            spending.conversionFactor
          );
        },
      },
    });
  }

  return (
    <Button
      block
      type="text"
      icon={<EditOutlined />}
      className={styles.actionButton}
      onClick={handleChangeAmount}
    >
      Изменить сумму покупки
    </Button>
  );
}

export default ChangeAmonutAction;
