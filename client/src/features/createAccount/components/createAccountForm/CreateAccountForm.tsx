import { Button, Form } from "antd";
import type { Currency } from "../../../userSetup/types/containerProfile.types";
import CurrencySelect from "../../../userSetup/components/currencySelect/CurrencySelect";
import AmountInput from "../../../userSetup/components/amountInput/AmountInput";
// import { useAccountsStore } from "../../../../store/accountsStore";
import { createAccount } from "../../api/createAccount";
import { changeCurrentAccount } from "../../api/changeCurrentAccount";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../../../../store/profileStore";
import { useAccountsStore } from "../../../../store/accountsStore";

type CreateAccountFormValues = {
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  accountAmount: string;
};

type CreateAccountFormProps = {
  currencies: Currency[];
};

function CreateAccountForm({ currencies }: CreateAccountFormProps) {
  const [form] = Form.useForm<CreateAccountFormValues>();
  const navigate = useNavigate();

  const changeProfileAccount = useProfileStore(
    (store) => store.changeProfileAccount
  );

  const updateListAmountAccounts = useAccountsStore(
    (store) => store.updateListAmountAccounts
  );

  function handleSubmit(values: CreateAccountFormValues) {
    async function createNewAccount() {
      try {
        const newAccountResponse = await createAccount({
          currencyCode: values.currencyCode,
          accountAmount: values.accountAmount,
        });

        updateListAmountAccounts(
          newAccountResponse.data.id,
          newAccountResponse.data.amount
        );

        const currentAccount = await changeCurrentAccount({
          accountId: newAccountResponse.data.id,
        });

        changeProfileAccount(currentAccount.data);

        navigate("/app");
      } catch (error) {
        console.log(error);
      }
    }

    createNewAccount();
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        currencyName: undefined,
        currencyCode: "",
        currencySymbol: "",
        accountAmount: "",
      }}
      onFinish={handleSubmit}
    >
      <CurrencySelect currencies={currencies} />

      <AmountInput />

      <Button type="primary" htmlType="submit">
        Сохранить
      </Button>
    </Form>
  );
}

export default CreateAccountForm;
