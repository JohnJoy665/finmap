import { Button, Flex, Form } from "antd";
import CurrencySelect from "../../../../shared/components/currencySelect/CurrencySelect";
import AmountInput from "../../../../shared/components/amountInput/AmountInput";
import { createAccount } from "../../api/createAccount";
import { changeCurrentAccount } from "../../api/changeCurrentAccount";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../../../../store/profileStore";
import { useAccountsStore } from "../../../../store/accountsStore";
import type { CreateAccountFormValues } from "../../types/createAccountForm.types";
import type { Currency } from "../../../../shared/types/currency.types";

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

        updateListAmountAccounts([
          {
            accountId: newAccountResponse.data.id,
            amount: newAccountResponse.data.amount,
          },
        ]);

        const currentAccount = await changeCurrentAccount({
          accountId: newAccountResponse.data.id,
        });

        changeProfileAccount(currentAccount.data);

        navigate("/app");
      } catch (error) {
        console.log(error); // TODO что-то надо здесь поменять будет ПОДУМАТЬ
      }
    }

    createNewAccount();
  }

  function handleClouse() {
    navigate("/app");
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
        conversionFactor: 100,
      }}
      onFinish={handleSubmit}
    >
      <CurrencySelect currencies={currencies} />

      <AmountInput lable="Какая сумма на счете?" />

      <Flex gap="middle">
        <Button block onClick={handleClouse}>
          Назад
        </Button>
        <Button block type="primary" htmlType="submit">
          Сохранить
        </Button>
      </Flex>
    </Form>
  );
}

export default CreateAccountForm;
