import json
import time

import lightning as L

from lightning_api_access import APIAccessFrontend


class ServeWork(L.LightningWork):
    def __init__(self, **kwargs):
        super().__init__(parallel=True, cache_calls=True, **kwargs)

    def run(self):
        print(f"Serving on {self.host}:{self.port}")
        while True:
            time.sleep(1000)


class ExampleApp(L.LightningFlow):
    def __init__(self):
        super().__init__()

        self.serve_work = ServeWork()

    def run(self):
        self.serve_work.run()

    def configure_layout(self):
        return APIAccessFrontend(
            apis=[
                {
                    "name": "get image by id",
                    "url": f"{self.serve_work.url}/get_image",
                    "method": "GET",
                    "request": {"id": "string"},
                    "response": "string",
                },
                {
                    "name": "list images",
                    "url": f"{self.serve_work.url}/list_images",
                    "method": "GET",
                    "request": {"size": "number"},
                    "response": [{"image": "...", "status": "..."}, {"image": "...", "status": "..."}],
                },
                {
                    "name": "resize image",
                    "url": "/resize",
                    "method": "POST",
                    "request": {"size": "number"},
                    "response": {"image": "...", "status": "..."},
                },
            ]
        )


app = L.LightningApp(ExampleApp())
