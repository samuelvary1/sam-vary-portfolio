// GameEngine.js

export const evaluateCommand = (input, game, setGame) => {
  const words = input.toLowerCase().trim().split(/\s+/);
  const command = words[0];

  switch (command) {
    case "go":
      return handleMovement(words[1], game, setGame);
    case "look":
    case "examine":
      return handleLook(words.slice(1), game);
    case "take":
    case "pick":
      return handleTake(words.slice(1), game, setGame);
    case "open":
      return handleOpen(words.slice(1), game, setGame);
    case "close":
      return handleClose(words.slice(1), game, setGame);
    case "read":
      return handleRead(words.slice(1), game);
    case "inventory":
    case "i":
      return showInventory(game);
    case "help":
    case "h":
      return game.messages.help;
    case "quit":
    case "exit":
      return "Thanks for playing!";
    default:
      return "I don't understand that command.";
  }
};

function handleMovement(dir, game, setGame) {
  const room = game.rooms[game.player.location];
  const direction = normalizeDirection(dir);

  if (!room.rooms || !room.rooms[direction]) {
    return `You can't go ${direction} from here.`;
  }

  const access = room.access_points?.[direction];
  if (access?.locked) {
    return (
      access.special_message ||
      `The ${access.game_handle_display || "way"} is locked.`
    );
  }

  const newRoomKey = room.rooms[direction];
  const newRoom = game.rooms[newRoomKey];
  const updatedRooms = {
    ...game.rooms,
    [newRoomKey]: { ...newRoom, been_before: true },
  };

  setGame({
    ...game,
    player: { ...game.player, location: newRoomKey },
    rooms: updatedRooms,
  });

  return newRoom.been_before ? newRoom.header : newRoom.first_time_message;
}

function normalizeDirection(dir) {
  const directions = {
    n: "north",
    s: "south",
    e: "east",
    w: "west",
    u: "up",
    d: "down",
  };
  return directions[dir] || dir;
}

function handleLook(words, game) {
  const room = game.rooms[game.player.location];
  const target = words.join(" ");

  if (target === "closer" || target === "carefully") {
    return room.details?.phrase || "You don't notice anything special.";
  }

  const visibleItems = Object.values(game.items).filter(
    (i) =>
      i.location === room.title || (i.inside && game.items[i.inside]?.open),
  );

  if (words.length === 0 || target === "around") {
    return visibleItems.length > 0
      ? visibleItems.map((i) => `You see ${i.description}`).join("\n")
      : "There's nothing of interest here.";
  }

  const match = findItem(target, game, room);
  if (!match) return "You don't see that here.";

  return match.details?.phrase || match.description;
}

function handleTake(words, game, setGame) {
  const target = words.join(" ");
  const room = game.rooms[game.player.location];
  const match = findItem(target, game, room);

  if (!match) return "You don't see that here.";
  if (match.mobile === false) return "That won't budge.";
  if (game.player.inventory.includes(match.handle))
    return "You're already carrying that.";

  const newItems = { ...game.items };
  newItems[match.handle].location = undefined;

  setGame({
    ...game,
    items: newItems,
    player: {
      ...game.player,
      inventory: [...game.player.inventory, match.handle],
    },
  });

  return `You picked up the ${match.handle}.`;
}

function handleOpen(words, game, setGame) {
  const target = words.join(" ");
  const item = findItem(target, game, game.rooms[game.player.location]);

  if (!item || !item.container) return "That's not something you can open.";
  if (item.open) return "That's already open.";

  const updatedItem = { ...item, open: true };
  setGame({ ...game, items: { ...game.items, [item.handle]: updatedItem } });

  return `You opened the ${item.handle}.`;
}

function handleClose(words, game, setGame) {
  const target = words.join(" ");
  const item = findItem(target, game, game.rooms[game.player.location]);

  if (!item || !item.container) return "That's not something you can close.";
  if (!item.open) return "That's already closed.";

  const updatedItem = { ...item, open: false };
  setGame({ ...game, items: { ...game.items, [item.handle]: updatedItem } });

  return `You closed the ${item.handle}.`;
}

function handleRead(words, game) {
  const target = words.join(" ");
  const match = findItem(target, game, game.rooms[game.player.location]);

  if (!match || !match.letter) return "There's nothing to read.";
  return match.details?.phrase || match.description;
}

function showInventory(game) {
  if (game.player.inventory.length === 0)
    return "You're not carrying anything.";

  return game.player.inventory
    .map((handle) => `- ${game.items[handle].description}`)
    .join("\n");
}

function findItem(name, game, room) {
  return Object.values(game.items).find(
    (item) =>
      [item.handle, item.alt_handle].includes(name) &&
      (item.location === room.title ||
        game.player.inventory.includes(item.handle) ||
        (item.inside && game.items[item.inside]?.open)),
  );
}
