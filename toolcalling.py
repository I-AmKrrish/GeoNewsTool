from dotenv import load_dotenv
load_dotenv()

from langchain_mistralai import ChatMistralAI
from langchain.tools import tool
from langchain_core.messages import HumanMessage
from rich import print



#1 creating a tool
@tool
def get_text_length(text: str) -> int:
    """Returns the number of character in a  given text."""
    return len(text)


tools = {
    "get_text_length" : get_text_length
}


#2 tool binding
llm = ChatMistralAI(model = "mistral-small-2506")
llm_with_tool = llm.bind_tools([get_text_length])

message = []
question = input("you: ")
query = HumanMessage(question)
message.append(query)
print(query)



result = llm_with_tool.invoke(message)
message.append(result)
print(result)


if result.tool_calls:
    tool_name = result.tool_calls[0]["name"]
    tool_message = tools[tool_name].invoke(result.tool_calls[0])
    message.append(tool_message)
    # print(message)


result = llm_with_tool.invoke(message)
print(result.content)










# #3 invoke the tool
# result = llm.invoke("Returns the number of characters in a given text: Hellow how are you?")
# result2 = llm_with_tool.invoke("Returns the number of characters in a given text: Hellow how are you?")

# # #checking the result
# # print(result)
# # print(result2) 

# #Execute tool
# if result2.tool_calls:
#     tool_call = result2.tool_calls[0]
#     tool_result = get_text_length.invoke(tool_call["args"])

#     #send back to llm
#     final_response = llm_with_tool.invoke(f"the lenght of text is {tool_result}")
#     print(final_response)

# #extraciting tool_name and argument
# # tool_name = tool_call["name"]
# # tool_args = tool_call["args"]





 