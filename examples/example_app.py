from xml.etree.ElementTree import TreeBuilder
import lightning as L
import time

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
        return APIAccessFrontend(apis=[{
            "url": f"{self.serve_work.host}:{self.serve_work.port}/get_image",
            "method": "GET",
            "request": None,
            "response": "{image: '...', status: '...'}",
        }])


app = L.LightningApp(ExampleApp())
