# Plug-and-Play Command Architecture

This document explains the new plug-and-play command system that allows for easy command development, management, and hot-reloading.

## Overview

The new command architecture provides:

- **True Plug-and-Play**: No hardcoded support functions - everything is a command
- **Automatic Discovery**: Commands are automatically loaded from the `src/commands/` directory
- **Hot Reloading**: Commands can be modified and reloaded without restarting the bot
- **Standardized Interface**: All commands follow the same structure with metadata
- **Validation**: Built-in argument validation and error handling
- **Categories**: Commands are organized by categories for better management
- **Lifecycle Hooks**: Commands can have load/unload hooks for initialization and cleanup

## Command Structure

Every command must follow this structure:

```typescript
export default {
  metadata: {
    name: '/command-name',
    description: 'Command description',
    category: 'Category',
    usage: '/command-name [args]',
    examples: ['/command-name', '/command-name arg1'],
    permissions: [],
    cooldown: 5,
    enabled: true,
    aliases: ['/alias1', '/alias2'],
    requiresGuild: false,
    requiresDM: false,
  },
  
  async execute(client: Client, message: Message, ...args: any[]): Promise<void> {
    // Command logic here
  },
  
  validate(args: any[]): boolean | string {
    // Validation logic here
    return true;
  },
  
  // Optional lifecycle hooks
  onLoad(): Promise<void> {
    // Called when command is loaded
  },
  
  onUnload(): Promise<void> {
    // Called when command is unloaded
  },
};
```

## Metadata Fields

### Required Fields

- **name**: The primary command name (e.g., '/help', '$bot')
- **description**: What the command does
- **category**: Command category (Utility, Admin, Fun, System, Special, User)
- **usage**: How to use the command
- **examples**: Array of usage examples

### Optional Fields

- **permissions**: Array of required permission role IDs
- **cooldown**: Cooldown in seconds (0 for no cooldown)
- **enabled**: Whether the command is enabled (default: true)
- **aliases**: Alternative command names
- **requiresGuild**: Whether command only works in servers (default: false)
- **requiresDM**: Whether command only works in DMs (default: false)

## Categories

- **Utility**: General utility commands (help, ping, info, etc.)
- **Admin**: Administrative commands (roles, permissions, bot messages, etc.)
- **Fun**: Entertainment commands (games, jokes, birthday wishes, etc.)
- **System**: System-level commands (startup, maintenance, notifications, etc.)
- **Special**: Special event commands (hacktoberfest, etc.)
- **User**: User-related commands (profile, settings, etc.)

## Creating a New Command

1. **Copy the template**:
   ```bash
   cp src/commands/_template.ts src/commands/myCommand.ts
   ```

2. **Customize the metadata**:
   ```typescript
   metadata: {
     name: '/mycommand',
     description: 'My awesome command',
     category: 'Utility',
     usage: '/mycommand [option]',
     examples: ['/mycommand', '/mycommand option1'],
     // ... other fields
   }
   ```

3. **Implement the execute function**:
   ```typescript
   async execute(client: Client, message: Message, ...args: any[]): Promise<void> {
     try {
       // Your command logic here
       await message.reply('Command executed!');
     } catch (error) {
       logger.errorWithContext('Command failed', error);
       await message.reply('An error occurred.');
     }
   }
   ```

4. **Add validation** (optional):
   ```typescript
   validate(args: any[]): boolean | string {
     if (args.length < 1) {
       return 'This command requires at least one argument';
     }
     return true;
   }
   ```

5. **Add lifecycle hooks** (optional):
   ```typescript
   onLoad(): Promise<void> {
     logger.info('My command loaded');
     return Promise.resolve();
   }
   
   onUnload(): Promise<void> {
     logger.info('My command unloaded');
     return Promise.resolve();
   }
   ```

## Command Types

### Slash Commands
Commands that start with `/` and are executed directly:
```typescript
// Usage: /help
async execute(client: Client, message: Message, ...args: any[]): Promise<void>
```

### Prefix Commands
Commands that use the `$` prefix and special syntax:
```typescript
// Usage: $bot | #channel | message
// Usage: $bday | #channel | user_id
// Usage: $role | role_id | user1 user2
// Usage: $dm | user_id/role_id | message
```

### Event Commands
Commands triggered by Discord events (reactions, member joins, etc.):
```typescript
// Usage: Triggered by events
async execute(client: Client, eventData: any): Promise<void>
```

## Hot Reloading

The command system supports hot reloading:

1. **Automatic Detection**: File changes in `src/commands/` are automatically detected
2. **Safe Reloading**: Commands are safely unloaded and reloaded
3. **Error Handling**: Invalid commands are skipped with proper logging
4. **Debouncing**: Multiple rapid changes are debounced to prevent excessive reloads

## Best Practices

### 1. Error Handling
Always wrap your command logic in try-catch:
```typescript
async execute(client: Client, message: Message, ...args: any[]): Promise<void> {
  try {
    // Your logic here
  } catch (error) {
    logger.errorWithContext('Command failed', error);
    await message.reply('An error occurred.');
  }
}
```

### 2. Logging
Use the logger for important events:
```typescript
logger.info('Command executed', {
  userId: message.author.id,
  command: 'mycommand',
  args: args
});
```

### 3. Validation
Always validate user input:
```typescript
validate(args: any[]): boolean | string {
  if (args.length < 1) {
    return 'This command requires an argument';
  }
  return true;
}
```

### 4. Permissions
Check permissions in your command:
```typescript
const hasPermission = message.member?.roles.cache.some(
  role => role.id === process.env.ADMIN_ROLE
);
if (!hasPermission) {
  await message.reply('You do not have permission to use this command.');
  return;
}
```

### 5. Cooldowns
Use cooldowns for resource-intensive commands:
```typescript
metadata: {
  cooldown: 30, // 30 seconds
  // ...
}
```

## Command Registry API

The command registry provides these methods:

```typescript
// Get all commands
const allCommands = commandRegistry.getAll();

// Get command by name
const command = commandRegistry.get('/help');

// Get commands by category
const utilityCommands = commandRegistry.getByCategory('Utility');

// Reload all commands
await commandRegistry.reload();
```

## Environment Variables

Make sure these environment variables are set:
- `DISCORDJS_BOT_TOKEN`: Discord bot token
- `PRIORITY_ROLE_01`: Primary admin role ID
- `PRIORITY_ROLE_02`: Secondary admin role ID
- `TARGET_CHANNEL`: Default target channel ID
- `LOBBY_CHANNEL`: Lobby channel ID
- `HF_CHANNEL`: Hacktoberfest channel ID
- `WELCOME_ROLE`: Welcome role ID

## Troubleshooting

### Command Not Loading
1. Check the file name ends with `.ts`
2. Ensure the export is the default export
3. Verify the metadata structure is correct
4. Check the console for validation errors

### Hot Reload Not Working
1. Ensure file watching is enabled
2. Check file permissions
3. Verify the commands directory path

### Command Execution Errors
1. Check the execute function signature
2. Verify argument validation
3. Ensure proper error handling
4. Check Discord.js permissions

## Migration from Old System

If you have existing commands, update them to use the new structure:

1. **Add metadata object** with all required fields
2. **Update execute function** to match new signature
3. **Add validation function** (optional)
4. **Add lifecycle hooks** (optional)
5. **Test the command** thoroughly

The new system is backward compatible with the old command structure, but using the new format provides better features and maintainability.

## Key Improvements

### True Plug-and-Play
- **No Hardcoded Functions**: All functionality is now implemented as commands
- **Universal Interface**: Every command follows the same structure
- **Automatic Discovery**: Just drop a file in the commands directory
- **Hot Reloading**: Modify commands without restarting

### Prefix Commands as Commands
The old system had hardcoded support functions for prefix commands. Now they're all proper commands:
- `$bot` → `/bot` command
- `$bday` → `/bday` command  
- `$role` → `/role` command
- `$dm` → `/dm` command

### Unified Architecture
- **Single Registry**: All commands (slash, prefix, event) use the same registry
- **Universal Executor**: One execution engine handles all command types
- **Consistent Validation**: All commands get the same validation and error handling
- **Standardized Logging**: All commands use the same logging system 