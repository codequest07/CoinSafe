import express from "express";
import history from "connect-history-api-fallback";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(
    history({
        index: "/",
    })
);
app.use(express.static(`${__dirname}/dist`));

const port = process.env.PORT || 3005;
const server = app.listen(port, () =>
    console.log(`Server started on port ${port}`)
);
