const messages = {
  en: {
    common: {
      back: "Back"
    },
    login: {
      enter: "Enter",
      fields_blank: "Please fill in all fields",
      login: "Login",
      password: "Pass",
      want_signup: "Would you like to signup?",
      name: "Name",
      guest_enter: "Enter as Guest",
      guest_help:
        "Guest users can do almost anything a normal user can do, but if you close the browser or if it crashes, your session will be lost."
    },
    signup: {
      do_signup: "Sign up",
      pass_mismatch: "Passwords do not match",
      repeat_pass: "Repeat pass",
      signup: "Sign up",
      success: "Thank you for signup! Welcome to The Kingdom G!",
      help: ""
    },
    rules: {
      rules: "Rules"
    },
    profile: {
      profile: "Profile",
      great_lord: "Great Lord",
      coat_of_arms: "Сoat of arms",
      new_coat_of_arms: "New coat of arms",
      last_game_date: "Last game date",
      statistics: "Statistics",
      mode: "Mode",
      total_games: "Total games",
      victories: "Victories",
      defeats: "Defeats",
      draws: "Draws",
      left_the_game: "Left the game",
      upload_avatar_error: "Failed to upload new coat of arms",
      change_avatar_size_error: "Failed to change the size of coat of arms",
      avatar_extension_error: "Wrong extension of coat of arms"
    },
    arena: {
      creategame: {
        create_game: "Create Game",
        game_name: "Game Name",
        mode: "Mode",
        turn_time: "Turn Time",
        password: "Password",
        repeat_password: "Repeat Password",
        no_limit: "no limit",
        minute: "min",
        create: "Create",
        back_to_list: "Back to Game List"
      },
      gamelist: {
        help: "You can enter as observer to started games.",
        game_list: "Games",
        new_games: "New",
        started_games: "Started",
        create_game: "Create game",
        enter: "Enter",
        enter_game_password: "Enter game password",
        players_count: "Players count",
        observers_count: "Observers count",
        creator: "Creator",
        name: "Name",
        mode: "Mode"
      },
      game: {
        help:
          "Create teams, drag and drop players, select features. Next press start game.",
        features: "Features",
        start: "Start game",
        selected_features: "Selected features",
        team: "Team",
        game: "Game",
        game_info: "Game info",
        time_limit: "Turn time limit",
        mode: "Mode",
        creator: "Creator",
        add_bot: "Add bot",
        exit: "Exit"
      },
      chat: {
        chat: "Chat",
        lords_in_chat: "Lords in chat",
        arena: "Arena",
        entered_chat: " entered the chat.",
        left_chat: " left the chat.",
        entered_arena: " entered the Arena."
      },
      players: {
        help:
          "Double click player to open private chat. Drag and drop player to create group chat.",
        lords: "Lords",
        level: "Level",
        nickname: "Nickname"
      }
    },
    errors: {
      1: "Server error",
      2: "Record not found",
      1001: "Please fill in all fields",
      1002: "Email is already taken",
      1003: "Wrong Email or password",
      1101: "User already in game",
      1102: "Game is already finished"
    }
  },
  ru: {
    common: {
      back: "Назад"
    },
    login: {
      enter: "Войти",
      fields_blank: "Заполните все поля",
      login: "Логин",
      password: "Пароль",
      want_signup: "Желаете зарегистрироваться?",
      name: "Имя",
      guest_enter: "Войти как гость",
      guest_help:
        "Гостевые пользователи могут делать все тоже, что и нормальные пользователи. Но если Вы закроете браузер, то не сможете зайти им снова."
    },
    signup: {
      do_signup: "Регистрация",
      pass_mismatch: "Пароли не совпадают",
      repeat_pass: "Повтор пароля",
      signup: "Регистрация",
      success: "Поздравляем с успешной регистрацией",
      help: ""
    },
    rules: {
      rules: "Правила"
    },
    profile: {
      profile: "Профиль",
      great_lord: "Великий Лорд",
      coat_of_arms: "Герб Лорда",
      new_coat_of_arms: "Выбрать новый герб",
      last_game_date: "Дата последней игры",
      statistics: "Статистика",
      mode: "Мод",
      total_games: "Все игры",
      victories: "Победы",
      defeats: "Поражения",
      draws: "Ничьи",
      left_the_game: "Вышел из игры",
      upload_avatar_error: "Не удалось загрузить герб",
      change_avatar_size_error: "Не удалось изменить размер герба",
      avatar_extension_error: "Неверное расширение файла с гербом"
    },
    arena: {
      creategame: {
        create_game: "Создать игру",
        game_name: "Имя игры",
        mode: "Мод",
        turn_time: "Время на ход",
        password: "Пароль",
        repeat_password: "Подтверждение пароля",
        no_limit: "не ограничено",
        minute: "мин",
        create: "Создать",
        back_to_list: "К списку игр"
      },
      gamelist: {
        help: "В начатые можно войти только наблюдателем.",
        game_list: "Список игр",
        new_games: "Новые",
        started_games: "Начатые",
        create_game: "Создать игру",
        enter: "Войти",
        enter_game_password: "Введите пароль к игре",
        players_count: "Количество игроков",
        observers_count: "Количество наблюдателей",
        creator: "Создатель",
        name: "Название",
        mode: "Мод"
      },
      game: {
        help:
          "Создайте команды, перетяните туда игроков, выберите особенности игры. Жмите начать игру.",
        features: "Управление особенностями",
        start: "Начать игру",
        selected_features: "Выбранные особенности",
        team: "Команда",
        game: "Игра",
        game_info: "Информация об игре",
        time_limit: "Ограничение времени на ход",
        mode: "Мод",
        creator: "Создатель",
        add_bot: "Добавить бота",
        exit: "Выход"
      },
      chat: {
        chat: "Чат",
        help:
          "Кликните на закладку чата, чтобы сделать его активным. Заголовок редактируется по двойному клику +ентер.",
        lords_in_chat: "Лорды в чате",
        arena: "Арена",
        entered_chat: " вошел в чат.",
        left_chat: " покинул чат.",
        entered_arena: " вошел в Арену."
      },
      players: {
        help:
          "Двойной клик - приватный. Перетянуть в чат для создания группового чата.",
        lords: "Лорды",
        level: "Уровень",
        nickname: "Имя игрока"
      }
    },
    errors: {
      1: "Ошибка сервера",
      2: "Запись не найдена",
      1001: "Заполните все поля",
      1002: "Email уже занят",
      1003: "Неверный Email или пароль",
      1101: "Пользователь уже в игре",
      1102: "Игра уже завершена"
    }
  }
};

export default messages;
