import json
import os
from typing import Any, Dict, List, Union

from lightning_utilities.core.imports import module_available

if module_available("lightning"):
    from lightning.app.frontend import StaticWebFrontend
elif module_available("lightning_app"):
    from lightning_app.frontend import StaticWebFrontend
else:
    raise ModuleNotFoundError(
        "Lightning is a required dependency for this component. Please run `pip install lightning`"
    )


class APIAccessFrontend(StaticWebFrontend):
    """The APIAccessFrontend enables you to give users a guide for interacting with your app via an API.

    Example:

        In your LightningFlow, override the method `configure_layout`:

        .. code-block:: python

            def configure_layout(self):
                return APIAccessFrontend(apis=[{
                    "name":"string",
                    "url": "endpoint_url",
                    "method": "POST|PUT|GET",
                    "request": "Example request JSON",
                    "response": "Example response JSON",
                    "code_sample": "Code sample for the user to run"  # if provided, `request` field will be ignored
                }])
    """

    def __init__(self, apis: Union[Dict[str, Any], List[Dict[str, Any]]]) -> None:
        ui_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ui", "build")
        super().__init__(ui_dir)

        # Write API metadata to a JSON file
        # Note: This will deliberately be performed each time the `APIAccessFrontend` so that
        # the metadata can change dynamically without issues
        self.metadata_file = os.path.join(ui_dir, "api_metadata.json")
        with open(self.metadata_file, "w") as f:
            json.dump({"apis": apis}, f)

    def stop_server(self) -> None:
        os.remove(self.metadata_file)
        return super().stop_server()
