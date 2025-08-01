# Chacko Mash Discord Bot

A modern, TypeScript-based Discord bot with optimized architecture and comprehensive features.

## 🚀 Features

- **Birthday Management**: Automated birthday wishes with custom image generation
- **Hacktoberfest Integration**: Certificate generation and email distribution
- **Role Management**: Advanced role assignment and management
- **Welcome System**: Automated welcome messages for new members
- **Health Monitoring**: Built-in health check server
- **Email Integration**: Automated email sending with templates
- **Image Generation**: Dynamic certificate and birthday image creation

## 🏗️ Architecture

### Directory Structure

```
src/
├── core/            # Core bot functionality
├── commands/        # Bot commands
├── services/        # External service integrations
├── types/           # TypeScript type definitions
└── server.ts        # Application entry point
```

### Key Components

#### 1. **Core Bot** (`src/core/DiscordBot.ts`)
- Main bot class with improved architecture
- Dynamic command loading
- Comprehensive error handling
- Permission management

#### 2. **Services** (`src/services/`)
- **API Client**: External API integration
- **Health Server**: Express-based health monitoring

#### 3. **Commands** (`src/commands/`)
- **Birthday Command**: Birthday message handling
- **Hacktoberfest Command**: Certificate processing

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.2+
- **Framework**: Discord.js 14.14+
- **HTTP Server**: Express 4.18+
- **Image Generation**: Canvas 2.11+
- **Email**: Nodemailer 6.9+


## 📦 Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chacko-mash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   DISCORDJS_BOT_TOKEN=your_discord_bot_token
   TARGET_CHANNEL=your_target_channel_id
   LOBBY_CHANNEL=your_lobby_channel_id
   HF_CHANNEL=your_hacktoberfest_channel_id
   PRIORITY_ROLE_01=your_priority_role_01_id
   PRIORITY_ROLE_02=your_priority_role_02_id
   API_BASE_URL=your_api_base_url
   INOVUS_AUTH_TOKEN=your_auth_token
   EMAIL_HOST=your_email_host
   EMAIL_PORT=587
   EMAIL_USER=your_email_user
   EMAIL_PASS=your_email_password
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the application**
   ```bash
   npm start
   ```

## 🚀 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run type-check` - TypeScript type checking

### Development Workflow

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Check code quality**
   ```bash
   npm run type-check
   ```



## 📊 Monitoring

### Health Endpoints

- `GET /health` - Application health status
- `GET /` - Application information

### Logging

The application uses Winston for structured logging:

- **File Logs**: `logs/error.log` and `logs/combined.log`
- **Console Logs**: Development environment only
- **Structured Format**: JSON with timestamps

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Application environment | No (default: development) |
| `PORT` | Health server port | No (default: 3000) |
| `DISCORDJS_BOT_TOKEN` | Discord bot token | Yes |
| `TARGET_CHANNEL` | Default target channel ID | Yes |
| `LOBBY_CHANNEL` | Lobby channel ID | Yes |
| `HF_CHANNEL` | Hacktoberfest channel ID | Yes |
| `PRIORITY_ROLE_01` | Primary priority role ID | Yes |
| `PRIORITY_ROLE_02` | Secondary priority role ID | Yes |
| `API_BASE_URL` | External API base URL | Yes |
| `INOVUS_AUTH_TOKEN` | API authentication token | Yes |
| `EMAIL_HOST` | SMTP host | Yes |
| `EMAIL_PORT` | SMTP port | Yes |
| `EMAIL_USER` | SMTP username | Yes |
| `EMAIL_PASS` | SMTP password | Yes |

## 🐳 Docker

### Build and Run

```bash
# Build image
docker build -t chacko-mash .

# Run container
docker run -d \
  --name chacko-mash \
  -p 3000:3000 \
  --env-file .env \
  chacko-mash
```

## 🔄 Migration from v1.0

### Key Changes

1. **TypeScript Migration**: Full TypeScript support with strict typing
2. **Modern Dependencies**: Updated to latest stable versions
3. **Improved Architecture**: Better separation of concerns
4. **Enhanced Error Handling**: Comprehensive error management
5. **Structured Logging**: Winston-based logging system
6. **Health Monitoring**: Express-based health server
7. **Code Quality**: TypeScript type checking

### Migration Steps

1. **Backup existing data**
2. **Update environment variables**
3. **Install new dependencies**
4. **Build and test**
5. **Deploy with new architecture**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Version**: 2.0.0  
**Last Updated**: 2024  
**Maintainer**: Decoded_Cipher