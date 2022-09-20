#!/usr/bin/env python
import os
from typing import List

from setuptools import find_packages, setup


def _load_requirements(
    path_dir: str, file_name: str = "requirements.txt", comment_char: str = "#"
) -> List[str]:
    """Load requirements from a file."""
    with open(os.path.join(path_dir, file_name)) as file:
        lines = [ln.strip() for ln in file.readlines()]
    reqs = []
    for ln in lines:
        # filer all comments
        if comment_char in ln:
            ln = ln[: ln.index(comment_char)].strip()
        # skip directly installed dependencies
        if ln.startswith("http"):
            continue
        # skip index url
        if ln.startswith("--extra-index-url"):
            continue
        if ln:  # if requirement is not empty
            reqs.append(ln)
    return reqs


setup(
    name="lightning_api_access",
    version="0.0.1",
    description="⚡ API Access UI ⚡",
    long_description="⚡ Lightning Frontend Showing how a given API can be accessed ⚡",
    author="Lightning et al.",
    author_email="ethan@lightning.ai",
    url="https://github.com/Lightning-AI/LAI-API-Access-UI-Component",
    packages=find_packages(exclude=["tests", "docs"]),
    include_package_data=True,
    keywords=["lightning"],
    python_requires=">=3.7",
    setup_requires=["wheel"],
    install_requires=_load_requirements(os.path.dirname(__file__)),
)