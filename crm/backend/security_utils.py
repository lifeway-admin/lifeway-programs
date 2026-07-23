import os


def safe_join(base_dir: str, filename: str) -> str:
    """Resolve `filename` under `base_dir`, raising ValueError if the result
    would escape the base directory (path traversal, absolute paths, UNC
    paths, drive-letter paths on Windows, etc.)."""
    base_real = os.path.realpath(base_dir)
    candidate = os.path.realpath(os.path.join(base_dir, filename))
    if os.path.commonpath([base_real, candidate]) != base_real:
        raise ValueError("Path escapes base directory")
    return candidate
