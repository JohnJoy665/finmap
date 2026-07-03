import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";

import styles from "./ChangeIncomeAmountAction.module.css";
import type { IncomeItem } from "../accountIncomesSection/AccountIncomesSection";
import { useModalStore } from "../../../../shared/ui/modal";
import { changeIncomeAmount } from "../../api/changeIncomeAmount";

type ChangeIncomeAmountActionProps = {
  income: IncomeItem;
  handleChangeIncomeAmount: (
    incomeId: string,
    newIncomeAmount: string,
    accountId: string,
    newAccountAmount: string
  ) => void;
};

function ChangeIncomeAmountAction({
  income,
  handleChangeIncomeAmount,
}: ChangeIncomeAmountActionProps) {
  const openModal = useModalStore((store) => store.openModal);

  async function getChangeIncomeAmount(
    incomeId,
    incomeAmount,
    conversionFactor
  ) {
    const response = await changeIncomeAmount({
      incomeId,
      incomeAmount: String(Number(incomeAmount) * conversionFactor),
    });

    handleChangeIncomeAmount(
      response.data.incomeId,
      response.data.incomeAmount,
      response.data.accountId,
      response.data.accountAmount
    );
  }

  function handleChangeAmount() {
    openModal({
      type: "changeAmount",
      strategy: "destroy",
      props: {
        conversionFactor: income.conversionFactor,
        currencySymbol: income.currencySymbol,
        oldAmount: String(Number(income.amount) / income.conversionFactor),
        itemId: income.id,
        fieldLable: "Сумма пополнения",
        title: "Изменить сумму пополнения",
        onChangeAmount: async (values) => {
          await getChangeIncomeAmount(
            values.itemId,
            values.newAmount,
            income.conversionFactor
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
      Изменить сумму пополнения
    </Button>
  );
}

export default ChangeIncomeAmountAction;
