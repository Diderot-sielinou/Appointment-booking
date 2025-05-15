import swaggerJSDoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Appointment Booking API',
      version: '1.0.0',
      description: 'Backend service for scheduling appointments with real-time notifications via websocket.',
      license: { 
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,

        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token **_only_**'
        },
      },
      schemas:{
        client:{
          type:"object",
          properties:{
            id:{type:'string',format:'uuid',description:'client id'},
            firstName:{type:'string',description:'client first name'},
            lastName:{type:'string',description:'client lastName name'},
            email:{type:'string',format:'email' ,description:'client email address'},
            address:{type:'string',description:" addresse client"},
            phone:{type:'string',description:" customer number"},
            // password:{type:'string',format:'uuid',description:'password client'},
            // profileImageUrl: { type: 'string', format: 'url', nullable: true, description: 'URL of the user\'s profile image' },
            createdAt: { type: 'string', format: 'date-time', description: 'Timestamp of user creation' },
          },
          required: ['id', 'firstName', 'lastName', 'email','password', 'createdAt']
        },
        provider:{
          type:"object",
          properties:{
            id:{type:'string',format:'uuid',description:'provider id'},
            fullName:{type:'string',description:'service provider full name'},
            email:{type:'string',format:'email' ,description:'provider email address'},
            adresse:{type:'string',description:" addresse provider"},
            work:{type:'string',description:" service provider profession"},
            aboutMe:{type:'string',description:" personality description"},
            phone:{type:'string',description:" customer number"},
            // password:{type:'string',format:'uuid',description:'password provider'},
            // profileImageUrl: { type: 'string', format: 'url', nullable: true, description: 'URL of the user\'s profile image' },
            // createdAt: { type: 'string', format: 'date-time', description: 'Timestamp of provider creation' },
          },
          required: ['id', 'fullName',  'email','password', 'createdAt']
        },
        timeSlot:{
          type:"object",
          properties:{
            id:{type:'string',format:'uuid',description:' id of create time slot'},
            provider_id:{type:'string',format:'uuid',description:'ID of the service provider who created the time slot'},
            start_time:{type: 'string', format: 'date', nullable: true,description:'start date ("DD/MM/YYYY HH:MM") and time of the time slot '},
            is_reserved:{type: 'boolean', default: false, description:'time slot status'},
            duration:{type:'number',description:" duration of the time slot"},
            created_at: { type: 'string', format: 'date-time', description: 'TIMESTAMPTZ of time slot creation' },
            updated_at: { type: 'string', format: 'date-time', description: 'TIMESTAMPTZ of last time slot update' },
          },
          required: ['id', 'provider_id',  'start_time','duration', 'createdAt','updated_at']
        },
        appointment:{
          type:"object",
          properties:{
            id:{type:'string',format:'uuid',description:' appointment id created'},
            provider_id:{type:'string',format:'uuid',description:'ID of the supplier concerned by the appointment'},
            client_id:{type:'string',format:'uuid',description:'ID of the customer who makes the appointment'},
            time_slot_id:{type:'string',format:'uuid',description:'ID of the time slot concerned by the appointment'},
            status:{type: 'string',default:"pending",description:"different status that the appointment can have(pending' 'confirmed', 'cancelled_by_client', cancelled_by_provider"},
            created_at: { type: 'string', format: 'date-time', description: 'TIMESTAMPTZ of appointment creation' },
            updated_at: { type: 'string', format: 'date-time', description: 'TIMESTAMPTZ of appointment update' },
          },
          required: ['id', 'provider_id',  'client_id','time_slot_id','status', 'createdAt','updated_at']
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Error message' },
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // chemin vers mes fichiers de routes
};

// Initialiser swagger-jsdoc
const swaggerSpec = swaggerJSDoc(swaggerOptions);

export  default swaggerSpec ;
