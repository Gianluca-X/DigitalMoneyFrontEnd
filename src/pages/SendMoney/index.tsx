import React, { useState, useEffect, useCallback } from 'react';
import {
  CardCustom,
  Icon,
  Records,
  FormSingle,
  IRecord,
  RecordVariant,
  SnackBar,
} from '../../components';
import { currencies, ERROR, ROUTES, STEP, UNAUTHORIZED } from '../../constants';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  handleChange,
  moneyValidationConfig,
  formatCurrency,
  getUserActivities,
  parseRecordContent,
  calculateTransacionType,
  getAccounts,
  getUser,
  createTransferActivity,
} from '../../utils';
import { Button } from '@mui/material';
import {
  ActivityType,
  Transaction,
  TransactionType,
  UserAccount,
  User,
} from '../../types';
import { useAuth, useLocalStorage, useUserInfo } from '../../hooks';

const SendMoney = () => {
  const [searchParams] = useSearchParams();
  const step = searchParams.get('step');
  const [userActivities, setUserActivities] = useState<Transaction[]>([]);
  const [userAccounts, setUserAccounts] = useState<IRecord[]>([]);
  const { logout } = useAuth();
  const { user } = useUserInfo();
  const [token] = useLocalStorage('token');

  useEffect(() => {
    if (user?.id && !step) {
      getUserActivities(user.id, token)
        .then((activities) => {
          const transfers = (activities as Transaction[]).filter(
            (activity) => activity.type === TransactionType.Transfer
          );
          setUserActivities(transfers);
        })
        .catch((error) => {
          if (error.status === UNAUTHORIZED) logout();
          console.error(error);
        });
    }
  }, [logout, step, token, user]);

  useEffect(() => {
    if (userActivities.length > 0) {
      const parsedRecords = userActivities
        .filter(
          (activity) =>
            calculateTransacionType(activity.amount, activity.type) ===
            ActivityType.TRANSFER_IN
        )
        .map((activity) =>
          parseRecordContent(
            { name: activity.name, origin: activity.origin },
            RecordVariant.ACCOUNT
          )
        );

      const uniqueRecords = parsedRecords.filter(
        (record, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              (t.content as Transaction).origin ===
              (record.content as Transaction).origin
          )
      );

      setUserAccounts(uniqueRecords);
    }
  }, [userActivities]);

  return (
    <div className="tw-w-full">
      {step ? (
        <SendMoneyForm />
      ) : (
        <>
          <CardCustom
            className="tw-max-w-5xl"
            content={
              <div className="tw-flex tw-justify-between tw-mb-4">
                <p className="tw-font-bold">Elegí a qué cuenta transferir</p>
              </div>
            }
            actions={
              <Link
                to={`${ROUTES.SEND_MONEY}?${STEP}1`}
                className="tw-w-full tw-flex tw-items-center tw-justify-between tw-p-4 hover:tw-bg-neutral-gray-500 tw-transition"
              >
                <div className="tw-flex tw-items-center tw-gap-x-4">
                  <Icon type="add" />
                  <p>Nueva cuenta</p>
                </div>
                <Icon type="arrow-right" />
              </Link>
            }
          />
          <CardCustom
            className="tw-max-w-5xl"
            content={
              <>
                <p className="tw-mb-4 tw-font-bold">Últimas cuentas</p>
                {userAccounts.length > 0 ? (
                  <Records records={userAccounts} />
                ) : (
                  <p>No hay cuentas registradas</p>
                )}
              </>
            }
          />
        </>
      )}
    </div>
  );
};

export default SendMoney;

const duration = 2000;

function SendMoneyForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUserInfo();
  const [token] = useLocalStorage('token');

  const step = searchParams.get('step');
  const initialDestination = searchParams.get('destination');

  const [destination, setDestination] = useState(initialDestination);
  const [formState, setFormState] = useState({
    destination: initialDestination || '',
    amount: '',
  });

  const [userDestinationAccount, setUserDestinationAccount] =
    useState<UserAccount>();
  const [userDestination, setUserDestination] = useState<User>();
  const [userOriginAccount, setUserOriginAccount] =
    useState<UserAccount>();

  // Buscar cuenta destino
  useEffect(() => {
    if (destination) {
      getAccounts(token)
        .then((accounts) => {
          const trimmed = destination.trim();
          const found = accounts.find(
            (account: UserAccount) =>
              account.cvu === trimmed || account.alias === trimmed
          );

          if (found) {
            setUserDestinationAccount(found);
          } else {
            setDestination(null);
            navigate(`${ROUTES.SEND_MONEY}?${STEP}1&${ERROR}`);
          }
        })
        .catch(console.error);
    }
  }, [destination, navigate, token]);

  // Obtener usuario destino
  useEffect(() => {
    if (userDestinationAccount) {
      getUser(userDestinationAccount.userId, token)
        .then(setUserDestination)
        .catch(console.error);
    }
  }, [userDestinationAccount, token]);

  // Obtener cuenta origen
  useEffect(() => {
    if (user?.id) {
      getAccounts(token)
        .then((accounts) => {
          const found = accounts.find(
            (account: UserAccount) => account.userId === user.id
          );
          if (found) setUserOriginAccount(found);
        })
        .catch(console.error);
    }
  }, [user, token]);

  const onNavigate = useCallback(
    (stepNumber: number) => {
      navigate(`${ROUTES.SEND_MONEY}?${STEP}${stepNumber}`);
    },
    [navigate]
  );

  useEffect(() => {
    if (step !== '1' && !formState.destination) {
      onNavigate(1);
    }
  }, [step, formState.destination, onNavigate]);

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    maxLength?: number
  ) => handleChange(event, setFormState, maxLength);

  const handleTransfer = () => {
    const parsedAmount = parseFloat(formState.amount || '0');

    if (!user?.id || !parsedAmount) return;

    createTransferActivity(
      user.id,
      {
        origin: userOriginAccount?.cvu || '',
        destination: userDestinationAccount?.cvu || '',
        amount: parsedAmount,
        name: userDestinationAccount?.name || '',
      },
      token
    )
      .then((response: any) => {
        navigate(`${ROUTES.ACTIVITY_DETAILS}?${STEP}${response.id}`);
      })
      .catch(console.error);
  };

  const { Argentina } = currencies;
  const { locales, currency } = Argentina;
  const isError = !!searchParams.get('error');

  switch (step) {
    case '1':
      return (
        <>
          <FormSingle
            name="destination"
            title="Agregá una nueva cuenta"
            label="CVU ó Alias"
            type="text"
            actionLabel="Continuar"
            formState={formState}
            handleChange={(e) => onChange(e)}
            submit={() => {
              if (formState.destination.trim()) {
                setDestination(formState.destination);
                onNavigate(2);
              }
            }}
          />
          {isError && (
            <SnackBar
              duration={duration}
              message="Cuenta no encontrada"
              type="error"
            />
          )}
        </>
      );

    case '2':
      return (
        <FormSingle
          name="amount"
          title={`¿Cuánto quieres transferir a ${
            userDestination?.firstName || ''
          }?`}
          label="Monto"
          type="number"
          actionLabel="Continuar"
          validation={moneyValidationConfig}
          formState={formState}
          handleChange={(e) => onChange(e)}
          submit={() => onNavigate(3)}
        />
      );

    case '3':
      return (
        <CardCustom
          content={
            <div className="tw-flex tw-flex-col">
              <p className="tw-font-bold tw-mb-4">
                Revisá que está todo bien
              </p>

              <div className="tw-mb-4">
                <p>Vas a transferir</p>
                <p className="tw-font-bold">
                  {formatCurrency(
                    locales,
                    currency,
                    parseFloat(formState.amount || '0')
                  )}
                </p>
              </div>

              <div className="tw-mb-4">
                <p>Para</p>
                <p className="tw-font-bold">
                  {userDestination
                    ? `${userDestination.firstName} ${userDestination.lastName}`
                    : ''}
                </p>
              </div>

              <p className="tw-font-bold">
                CVU: {formState.destination}
              </p>
            </div>
          }
          actions={
            <div className="tw-flex tw-w-full tw-justify-end tw-mt-6">
              <Button
                variant="outlined"
                onClick={handleTransfer}
              >
                Transferir
              </Button>
            </div>
          }
        />
      );

    default:
      return null;
  }
}