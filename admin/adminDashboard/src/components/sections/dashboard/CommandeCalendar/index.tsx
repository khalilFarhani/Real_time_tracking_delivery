import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PickersCalendarHeaderProps } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import IconifyIcon from 'components/base/IconifyIcon';
import { Typography, Box, CircularProgress, useTheme, SxProps } from '@mui/material';

interface CalendarHeaderProps {
  currentMonth: Dayjs;
  onMonthChange: (month: Dayjs) => void;
  onYearChange: (year: Dayjs) => void;
}

interface CommandeCreee {
  date: string;
  jour: number;
  mois: number;
  annee: number;
  nombreCommandes: number;
}

const months = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const years = Array.from({ length: 100 }, (_, i) => dayjs().year() - 50 + i);

const CalendarHeader = ({ currentMonth, onMonthChange, onYearChange }: CalendarHeaderProps) => {
  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    const month = event.target.value as number;
    onMonthChange(dayjs(currentMonth).month(month));
  };

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    const year = event.target.value as number;
    onYearChange(dayjs(currentMonth).year(year));
  };

  return (
    <Stack pb={1} spacing={2} justifyContent="center">
      <FormControl
        variant="filled"
        sx={{
          '& .MuiInputBase-root': {
            '&:focus-within': {
              borderColor: 'transparent !important',
              boxShadow: 'none',
            },
          },
        }}
      >
        <Select
          value={currentMonth.month()}
          onChange={handleMonthChange}
          IconComponent={() => (
            <IconifyIcon icon="ic:round-keyboard-arrow-down" fontSize="h3.fontSize" />
          )}
          sx={(theme) => ({
            '&.MuiInputBase-root': {
              bgcolor: `${theme.palette.info.main} !important`,
              '& .MuiBox-root': {
                color: 'primary.main',
              },
            },
            '& .MuiSelect-select': {
              color: `${theme.palette.primary.main} !important`,
            },
          })}
        >
          {months.map((month, index) => (
            <MenuItem key={index} value={index}>
              {month}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        variant="filled"
        sx={{
          '& .MuiInputBase-root': {
            bgcolor: 'transparent !important',
            '&:focus-within': {
              borderColor: 'transparent !important',
              boxShadow: 'none',
            },
          },
        }}
      >
        <Select
          value={currentMonth.year()}
          onChange={handleYearChange}
          sx={(theme) => ({
            '& .MuiSelect-select': {
              color: `${theme.palette.text.primary} !important`,
            },
          })}
          IconComponent={() => (
            <IconifyIcon icon="ic:round-keyboard-arrow-down" fontSize="h3.fontSize" />
          )}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
};

interface CommandeCalendarProps {
  sx?: SxProps;
}

const CommandeCalendar = ({ sx }: CommandeCalendarProps) => {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [commandesCreees, setCommandesCreees] = useState<CommandeCreee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const theme = useTheme();

  const API_URL = 'http://localhost:5283';

  const handleMonthChange = (month: Dayjs) => {
    setCurrentDate(month);
    fetchCommandesCreees();
  };

  const handleYearChange = (year: Dayjs) => {
    setCurrentDate(year);
    fetchCommandesCreees();
  };

  const fetchCommandesCreees = async () => {
    try {
      setIsLoading(true);

      // Appeler l'API pour récupérer toutes les commandes créées
      const url = `${API_URL}/api/statistiques/commandes-creees-par-jour`;
      console.log("URL de l'API:", url);

      const response = await axios.get(url);
      console.log("Données reçues de l'API:", response.data);

      // Utiliser uniquement les données réelles de l'API
      setCommandesCreees(response.data);

      if (response.data && response.data.length === 0) {
        console.warn('Aucune commande créée trouvée');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des commandes créées:', err);
      setCommandesCreees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandesCreees();
  }, []); // Exécuter une seule fois au chargement du composant

  // Function to calculate color intensity based on order count
  const getColorIntensity = (count: number) => {
    if (count === 0) return 'transparent';

    // Définir une intensité minimale pour que même 1 commande soit visible
    // et une intensité maximale pour les valeurs plus élevées
    let intensity;

    if (count === 1) {
      intensity = 0.3; // 30% d'intensité minimale pour 1 commande
    } else if (count === 2) {
      intensity = 0.45; // 45% d'intensité pour 2 commandes
    } else {
      // Pour 3 commandes et plus, calculer l'intensité de manière progressive
      const maxCount = Math.max(...commandesCreees.map((c) => c.nombreCommandes), 10);
      const normalizedCount = Math.min(count / maxCount, 1);
      // Échelle non linéaire commençant à 0.6 (60%) pour 3 commandes
      intensity = 0.6 + normalizedCount * 0.4;
    }

    // Convertir l'intensité en code hexadécimal pour l'opacité (de 4D à FF)
    const opacityHex = Math.round(intensity * 255)
      .toString(16)
      .padStart(2, '0');

    return `${theme.palette.success.main}${opacityHex}`;
  };

  // Function to get order count for a specific date
  const getCommandesCount = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    const commande = commandesCreees.find((c) => c.date === dateStr);
    return commande ? commande.nombreCommandes : 0;
  };

  return (
    <Box component={Paper} sx={{ p: 3, ...sx }}>
      {isLoading && (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}
        >
          <CircularProgress size={30} color="primary" />
          <Typography ml={2}>Chargement des données...</Typography>
        </Box>
      )}

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar
          sx={{ width: 1 }}
          slots={{
            calendarHeader: (props: PickersCalendarHeaderProps<Dayjs>) => (
              <CalendarHeader
                currentMonth={props.currentMonth}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
              />
            ),
            day: (props) => {
              const count = getCommandesCount(props.day);
              const backgroundColor = getColorIntensity(count);
              const isOutsideCurrentMonth = !dayjs(props.day).isSame(currentDate, 'month');

              return (
                <div
                  key={props.day.toString()}
                  onClick={() => {
                    setCurrentDate(props.day);
                  }}
                  style={{
                    backgroundColor,
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    color:
                      count > 0
                        ? '#ffffff' // Noir pour les jours avec commandes
                        : isOutsideCurrentMonth
                          ? theme.palette.text.secondary
                          : theme.palette.text.primary,
                    transition: 'background-color 0.3s ease',
                    fontSize: '0.70rem', // Revenir à la taille d'origine
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  {props.day.date()}
                </div>
              );
            },
          }}
          dayOfWeekFormatter={(date: Dayjs) => {
            const dayMap: { [key: string]: string } = {
              Su: 'Di',
              Mo: 'Lu',
              Tu: 'Ma',
              We: 'Me',
              Th: 'Je',
              Fr: 'Ve',
              Sa: 'Sa',
            };
            return dayMap[date.format('dd')] || date.format('dd');
          }}
          value={currentDate}
          onChange={(date) => setCurrentDate(date as Dayjs)}
          showDaysOutsideCurrentMonth
          fixedWeekNumber={6}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default CommandeCalendar;
