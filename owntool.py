from langchain.tools import tool




@tool("Get Greetings")  #decorator for greeting tool
def get_greetings(name: str) -> str:    #type hints for input and output
    """Generate a greeting message for the user. """    #docstring
    return f"Hello, {name}, welcome to AI world"



result = get_greetings.invoke({"name": "Krrish"})
print(result)

print(get_greetings.name)
print(get_greetings.description)
print(get_greetings.args)